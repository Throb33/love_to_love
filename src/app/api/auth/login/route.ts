import {NextResponse} from 'next/server';
import {ADMIN_PHONE, SESSION_COOKIE, statusPath} from '@/lib/auth';
import {badRequest} from '@/lib/api';
import {prisma} from '@/lib/prisma';
import {verifyLoginSmsCode} from '@/lib/sms';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = String(body.phone ?? '').trim();
  const code = String(body.code ?? '').trim();

  const verification = await verifyLoginSmsCode(phone, code);

  if (!verification.ok) {
    return badRequest(verification.error);
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
