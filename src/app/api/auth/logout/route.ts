import {NextResponse} from 'next/server';
import {SESSION_COOKIE} from '@/lib/auth';

export async function POST(request: Request) {
  const host = request.headers.get('host') ?? new URL(request.url).host;
  const protocol = request.headers.get('x-forwarded-proto') ?? 'http';
  const response = NextResponse.redirect(`${protocol}://${host}/login`, {status: 303});
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
