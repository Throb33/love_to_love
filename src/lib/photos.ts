import {prisma} from './prisma';

export const syncProfilePhotos = async (userId: string, urls: string[]) => {
  const uniqueUrls = Array.from(new Set(urls.map((url) => url.trim()).filter(Boolean))).slice(0, 6);

  await prisma.profilePhoto.deleteMany({
    where: {
      userId,
      url: {notIn: uniqueUrls.length > 0 ? uniqueUrls : ['']},
    },
  });

  await Promise.all(
    uniqueUrls.map((url) =>
      prisma.profilePhoto.upsert({
        where: {userId_url: {userId, url}},
        update: {},
        create: {userId, url, status: 'PENDING'},
      }),
    ),
  );

  return uniqueUrls;
};

export const getApprovedPhotoUrls = async (userId: string) => {
  const photos = await prisma.profilePhoto.findMany({
    where: {userId, status: 'APPROVED'},
    orderBy: {createdAt: 'asc'},
  });

  return photos.map((photo) => photo.url);
};
