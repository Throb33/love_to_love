import {json, requireApiAdmin} from '@/lib/api';
import {parseList} from '@/lib/json';
import {prisma} from '@/lib/prisma';

export async function GET(request: Request) {
  const {response} = await requireApiAdmin();

  if (response) {
    return response;
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status') || undefined;
  const users = await prisma.user.findMany({
    where: {role: 'USER', ...(status ? {status: status as never} : {})},
    include: {profile: true, reportsAgainst: true},
    orderBy: {createdAt: 'desc'},
    take: 100,
  });

  return json({
    users: users.map((user) => ({
      ...user,
      profile: user.profile
        ? {...user.profile, interests: parseList(user.profile.interests)}
        : null,
      reportCount: user.reportsAgainst.length,
    })),
  });
}
