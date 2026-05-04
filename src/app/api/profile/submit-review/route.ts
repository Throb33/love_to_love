import {badRequest, json, requireApiUser, unauthorized} from '@/lib/api';
import {prisma} from '@/lib/prisma';

export async function POST() {
  const user = await requireApiUser();

  if (!user) {
    return unauthorized();
  }

  const fullUser = await prisma.user.findUnique({
    where: {id: user.id},
    include: {profile: true, preferences: true},
  });

  if (!fullUser?.profile || !fullUser.preferences) {
    return badRequest('请先完成资料和择偶偏好');
  }

  await prisma.user.update({
    where: {id: user.id},
    data: {status: 'PENDING_REVIEW'},
  });

  return json({ok: true, redirectTo: '/profile/reviewing'});
}
