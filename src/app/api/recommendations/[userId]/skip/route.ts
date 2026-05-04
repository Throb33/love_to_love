import {json, requireApiApprovedUser} from '@/lib/api';
import {prisma} from '@/lib/prisma';

export async function POST(
  _request: Request,
  context: {params: Promise<{userId: string}>},
) {
  const {user, response} = await requireApiApprovedUser();

  if (response) {
    return response;
  }

  const {userId} = await context.params;
  await prisma.skip.upsert({
    where: {fromUserId_toUserId: {fromUserId: user.id, toUserId: userId}},
    update: {},
    create: {fromUserId: user.id, toUserId: userId},
  });

  return json({ok: true});
}
