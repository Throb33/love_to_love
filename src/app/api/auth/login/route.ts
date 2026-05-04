import {NextResponse} from 'next/server';
import {ADMIN_PHONE, FIXED_CODE, SESSION_COOKIE, statusPath} from '@/lib/auth';
import {badRequest} from '@/lib/api';
import {prisma} from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = String(body.phone ?? '').trim();
  const code = String(body.code ?? '').trim();

  if (!/^1\d{10}$/.test(phone)) {
    return badRequest('请输入有效的中国大陆手机号');
  }

  if (code !== FIXED_CODE) {
    return badRequest('验证码错误，开发环境请使用 123456');
  }

  const isAdmin = phone === ADMIN_PHONE;
  const user = await prisma.user.upsert({
    where: {phone},
    update: {
      lastActiveAt: new Date(),
      ...(isAdmin ? {role: 'ADMIN' as const, status: 'APPROVED' as const} : {}),
    },
    create: {
      phone,
      role: isAdmin ? 'ADMIN' : 'USER',
      status: isAdmin ? 'APPROVED' : 'DRAFT',
    },
  });

  const response = NextResponse.json({
    ok: true,
    user,
    redirectTo: user.role === 'ADMIN' ? '/admin' : statusPath(user.status),
  });
  response.cookies.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
