import {badRequest, json} from '@/lib/api';
import {requestLoginSmsCode} from '@/lib/sms';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = String(body.phone ?? '').trim();

  try {
    const result = await requestLoginSmsCode(phone);

    if (!result.ok) {
      return badRequest(result.error);
    }

    return json({
      ok: true,
      expiresAt: result.expiresAt,
      devCode: result.devCode,
      message: result.devCode
        ? `开发环境验证码：${result.devCode}`
        : '验证码已发送，请注意查收短信',
    });
  } catch (error) {
    console.error(error);
    return json({error: '短信发送失败，请稍后再试'}, {status: 502});
  }
}
