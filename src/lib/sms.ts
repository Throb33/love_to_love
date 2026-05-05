import {createHash, randomInt} from 'node:crypto';
import {prisma} from './prisma';

const loginPurpose = 'LOGIN';
const codeTtlMs = 5 * 60 * 1000;
const resendCooldownMs = 60 * 1000;
const hourlyLimit = 5;
const maxAttempts = 5;

const isProduction = process.env.NODE_ENV === 'production';

const smsProvider = () => process.env.SMS_PROVIDER || 'console';

const codeSecret = () => {
  const secret = process.env.SMS_CODE_SECRET || '';

  if (isProduction && secret.length < 24) {
    throw new Error('SMS_CODE_SECRET must be configured in production');
  }

  return secret || 'dev-only-sms-secret';
};

const normalizePhone = (phone: string) => phone.trim();

export const isValidMainlandPhone = (phone: string) => /^1\d{10}$/.test(phone);

const hashCode = (phone: string, purpose: string, code: string) =>
  createHash('sha256')
    .update(`${codeSecret()}:${phone}:${purpose}:${code}`)
    .digest('hex');

const generateCode = () => String(randomInt(0, 1000000)).padStart(6, '0');

type SendSmsResult = {
  provider: string;
  providerMessageId?: string;
  devCode?: string;
};

const sendWithConsoleProvider = async (phone: string, code: string): Promise<SendSmsResult> => {
  console.info(`[sms:console] phone=${phone} code=${code}`);
  return {provider: 'console', devCode: code};
};

const sendWithHttpProvider = async (phone: string, code: string): Promise<SendSmsResult> => {
  const endpoint = process.env.SMS_HTTP_ENDPOINT;

  if (!endpoint) {
    throw new Error('SMS_HTTP_ENDPOINT is not configured');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.SMS_HTTP_TOKEN
        ? {Authorization: `Bearer ${process.env.SMS_HTTP_TOKEN}`}
        : {}),
    },
    body: JSON.stringify({
      phone,
      code,
      templateId: process.env.SMS_TEMPLATE_ID || undefined,
      signName: process.env.SMS_SIGN_NAME || undefined,
      scene: loginPurpose,
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`SMS provider failed: ${response.status} ${text}`);
  }

  let providerMessageId: string | undefined;
  try {
    const data = JSON.parse(text) as {messageId?: string; id?: string; requestId?: string};
    providerMessageId = data.messageId || data.id || data.requestId;
  } catch {
    providerMessageId = undefined;
  }

  return {provider: 'generic_http', providerMessageId};
};

const sendSms = async (phone: string, code: string) => {
  const provider = smsProvider();

  if (provider === 'console') {
    return sendWithConsoleProvider(phone, code);
  }

  if (provider === 'generic_http') {
    return sendWithHttpProvider(phone, code);
  }

  throw new Error(`Unsupported SMS_PROVIDER: ${provider}`);
};

export const requestLoginSmsCode = async (rawPhone: string) => {
  const phone = normalizePhone(rawPhone);

  if (!isValidMainlandPhone(phone)) {
    return {ok: false as const, error: '请输入有效的中国大陆手机号'};
  }

  const now = new Date();
  const cooldownSince = new Date(now.getTime() - resendCooldownMs);
  const hourSince = new Date(now.getTime() - 60 * 60 * 1000);

  const recent = await prisma.smsVerificationCode.findFirst({
    where: {
      phone,
      purpose: loginPurpose,
      createdAt: {gte: cooldownSince},
    },
    orderBy: {createdAt: 'desc'},
  });

  if (recent) {
    return {ok: false as const, error: '验证码发送过于频繁，请 1 分钟后再试'};
  }

  const hourlyCount = await prisma.smsVerificationCode.count({
    where: {
      phone,
      purpose: loginPurpose,
      createdAt: {gte: hourSince},
    },
  });

  if (hourlyCount >= hourlyLimit) {
    return {ok: false as const, error: '该手机号验证码请求过多，请 1 小时后再试'};
  }

  const code = generateCode();
  const sent = await sendSms(phone, code);
  const record = await prisma.smsVerificationCode.create({
    data: {
      phone,
      purpose: loginPurpose,
      codeHash: hashCode(phone, loginPurpose, code),
      sendProvider: sent.provider,
      providerMessageId: sent.providerMessageId,
      expiresAt: new Date(now.getTime() + codeTtlMs),
    },
  });

  return {
    ok: true as const,
    expiresAt: record.expiresAt,
    devCode: sent.devCode,
  };
};

export const verifyLoginSmsCode = async (rawPhone: string, rawCode: string) => {
  const phone = normalizePhone(rawPhone);
  const code = rawCode.trim();

  if (!isValidMainlandPhone(phone)) {
    return {ok: false as const, error: '请输入有效的中国大陆手机号'};
  }

  if (!/^\d{6}$/.test(code)) {
    return {ok: false as const, error: '请输入 6 位短信验证码'};
  }

  const record = await prisma.smsVerificationCode.findFirst({
    where: {
      phone,
      purpose: loginPurpose,
      consumedAt: null,
    },
    orderBy: {createdAt: 'desc'},
  });

  if (!record) {
    return {ok: false as const, error: '请先获取短信验证码'};
  }

  if (record.expiresAt.getTime() < Date.now()) {
    return {ok: false as const, error: '验证码已过期，请重新获取'};
  }

  if (record.attempts >= maxAttempts) {
    return {ok: false as const, error: '验证码错误次数过多，请重新获取'};
  }

  const matched = record.codeHash === hashCode(phone, loginPurpose, code);

  if (!matched) {
    await prisma.smsVerificationCode.update({
      where: {id: record.id},
      data: {attempts: {increment: 1}},
    });
    return {ok: false as const, error: '验证码错误'};
  }

  await prisma.smsVerificationCode.update({
    where: {id: record.id},
    data: {consumedAt: new Date()},
  });

  return {ok: true as const};
};
