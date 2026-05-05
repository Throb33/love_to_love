import {json, requireApiAdmin} from '@/lib/api';
import {prisma} from '@/lib/prisma';

export async function POST(
  _request: Request,
  context: {params: Promise<{userId: string}>},
) {
  const {user: admin, response} = await requireApiAdmin();

  if (response) {
    return response;
  }

  const {userId} = await context.params;
  await prisma.$transaction([
    prisma.user.update({where: {id: userId}, data: {status: 'APPROVED'}}),
    prisma.moderationLog.create({
      data: {actorId: admin.id, targetUserId: userId, action: 'USER_UNBANNED'},
    }),
  ]);
  return json({ok: true});
}
