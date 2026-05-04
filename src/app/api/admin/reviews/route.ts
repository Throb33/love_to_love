import {json, requireApiAdmin} from '@/lib/api';
import {parseList} from '@/lib/json';
import {prisma} from '@/lib/prisma';

export async function GET() {
  const {response} = await requireApiAdmin();

  if (response) {
    return response;
  }

  const users = await prisma.user.findMany({
    where: {status: 'PENDING_REVIEW'},
    include: {profile: true, preferences: true},
    orderBy: {updatedAt: 'asc'},
  });

  return json({
    users: users.map((user) => ({
      ...user,
      profile: user.profile
        ? {...user.profile, interests: parseList(user.profile.interests)}
        : null,
      preferences: user.preferences
        ? {
            ...user.preferences,
            preferredCities: parseList(user.preferences.preferredCities),
            maritalStatuses: parseList(user.preferences.maritalStatuses),
          }
        : null,
    })),
  });
}
