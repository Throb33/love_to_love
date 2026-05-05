import {json, requireApiAdmin} from '@/lib/api';
import {prisma} from '@/lib/prisma';

export async function POST(
  _request: Request,
  context: {params: Promise<{photoId: string}>},
) {
  const {user: admin, response} = await requireApiAdmin();

  if (response) {
    return response;
  }

  const {photoId} = await context.params;
  const photo = await prisma.profilePhoto.update({
    where: {id: photoId},
    data: {
      status: 'APPROVED',
      reviewerId: admin.id,
      reviewedAt: new Date(),
      rejectReason: null,
    },
  });

  await prisma.moderationLog.create({
    data: {
      actorId: admin.id,
      targetUserId: photo.userId,
      action: 'PHOTO_APPROVED',
      metadata: JSON.stringify({photoId, url: photo.url}),
    },
  });

  return json({ok: true});
}
