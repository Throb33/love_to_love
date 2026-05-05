import {badRequest, json, requireApiAdmin} from '@/lib/api';
import {prisma} from '@/lib/prisma';

export async function POST(
  request: Request,
  context: {params: Promise<{photoId: string}>},
) {
  const {user: admin, response} = await requireApiAdmin();

  if (response) {
    return response;
  }

  const body = await request.json().catch(() => ({}));
  const reason = String(body.reason ?? '').trim();

  if (!reason) {
    return badRequest('请填写驳回原因');
  }

  const {photoId} = await context.params;
  const photo = await prisma.profilePhoto.update({
    where: {id: photoId},
    data: {
      status: 'REJECTED',
      reviewerId: admin.id,
      reviewedAt: new Date(),
      rejectReason: reason,
    },
  });

  await prisma.moderationLog.create({
    data: {
      actorId: admin.id,
      targetUserId: photo.userId,
      action: 'PHOTO_REJECTED',
      note: reason,
      metadata: JSON.stringify({photoId, url: photo.url}),
    },
  });

  return json({ok: true});
}
