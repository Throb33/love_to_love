import {json, unauthorized} from '@/lib/api';
import {getCurrentUser, statusPath} from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  return json({
    user,
    redirectTo: user.role === 'ADMIN' ? '/admin' : statusPath(user.status),
  });
}
