import {json, requireApiApprovedUser} from '@/lib/api';
import {prisma} from '@/lib/prisma';

export async function POST(
  request: Request,
  context: {params: Promise<{userId: string}>},
) {
  const {user, response} = await requireApiApprovedUser();

  if (response) {
    return response;
  }

  const {userId} = await context.params;
  const body = await request.json().catch(() => ({}));
  const reason = String(body.reason ?? '').trim() || null;

  await prisma.skip.upsert({
    where: {fromUserId_toUserId: {fromUserId: user.id, toUserId: userId}},
    update: {reason},
    create: {fromUserId: user.id, toUserId: userId, reason},
  });

  return json({ok: true});
}
