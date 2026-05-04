import {json, requireApiApprovedUser} from '@/lib/api';
import {parseList, ageFromBirthYear} from '@/lib/json';
import {prisma} from '@/lib/prisma';

export async function GET() {
  const {user, response} = await requireApiApprovedUser();

  if (response) {
    return response;
  }

  const matches = await prisma.match.findMany({
    where: {OR: [{userAId: user.id}, {userBId: user.id}]},
    include: {
      userA: {include: {profile: true}},
      userB: {include: {profile: true}},
      messages: {orderBy: {createdAt: 'desc'}, take: 1},
    },
    orderBy: {createdAt: 'desc'},
  });

  return json({
    matches: matches.map((match) => {
      const other = match.userAId === user.id ? match.userB : match.userA;
      return {
        id: match.id,
        status: match.status,
        createdAt: match.createdAt,
        other: other.profile
          ? {
              id: other.id,
              nickname: other.profile.nickname,
              age: ageFromBirthYear(other.profile.birthYear),
              city: other.profile.city,
              occupation: other.profile.occupation,
              avatarUrl: other.profile.avatarUrl,
              interests: parseList(other.profile.interests),
            }
          : null,
        lastMessage: match.messages[0] ?? null,
      };
    }),
  });
}
