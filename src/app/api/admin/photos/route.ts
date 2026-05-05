import {json, requireApiAdmin} from '@/lib/api';
import {prisma} from '@/lib/prisma';

export async function GET() {
  const {response} = await requireApiAdmin();

  if (response) {
    return response;
  }

  const photos = await prisma.profilePhoto.findMany({
    where: {status: 'PENDING'},
    include: {user: {include: {profile: true}}},
    orderBy: {createdAt: 'asc'},
  });

  return json({
    photos: photos.map((photo) => ({
      id: photo.id,
      url: photo.url,
      createdAt: photo.createdAt,
      user: {
        id: photo.user.id,
        phone: photo.user.phone,
        nickname: photo.user.profile?.nickname ?? '未填写资料',
        city: photo.user.profile?.city ?? '',
      },
    })),
  });
}
