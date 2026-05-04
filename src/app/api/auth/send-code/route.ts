import {FIXED_CODE} from '@/lib/auth';
import {badRequest, json} from '@/lib/api';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = String(body.phone ?? '').trim();

  if (!/^1\d{10}$/.test(phone)) {
    return badRequest('请输入有效的中国大陆手机号');
  }

  return json({ok: true, code: FIXED_CODE, message: '开发环境固定验证码为 123456'});
}
