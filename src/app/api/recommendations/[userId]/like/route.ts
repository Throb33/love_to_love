import {json, requireApiApprovedUser} from '@/lib/api';
import {normalizedPair} from '@/lib/matching';
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
  await prisma.like.upsert({
    where: {fromUserId_toUserId: {fromUserId: user.id, toUserId: userId}},
    update: {},
    create: {fromUserId: user.id, toUserId: userId},
  });

  const reciprocal = await prisma.like.findUnique({
    where: {fromUserId_toUserId: {fromUserId: userId, toUserId: user.id}},
  });

  let match = null;

  if (reciprocal) {
    const [userAId, userBId] = normalizedPair(user.id, userId);
    match = await prisma.match.upsert({
      where: {userAId_userBId: {userAId, userBId}},
      update: {status: 'ACTIVE', closedAt: null},
      create: {userAId, userBId},
    });
  }

  return json({ok: true, matched: Boolean(match), match});
}
