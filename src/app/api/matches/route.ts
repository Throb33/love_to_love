import {json, requireApiApprovedUser} from '@/lib/api';
import {ageFromBirthYear, parseList} from '@/lib/json';
import {prisma} from '@/lib/prisma';

export async function GET() {
  const {user, response} = await requireApiApprovedUser();

  if (response) {
    return response;
  }

  const matches = await prisma.match.findMany({
    where: {status: 'ACTIVE', OR: [{userAId: user.id}, {userBId: user.id}]},
    include: {
      userA: {include: {profile: true}},
      userB: {include: {profile: true}},
      messages: {orderBy: {createdAt: 'desc'}, take: 1},
    },
    orderBy: {createdAt: 'desc'},
  });

  const unreadCounts = await prisma.message.groupBy({
    by: ['matchId'],
    where: {
      senderId: {not: user.id},
      readAt: null,
      match: {status: 'ACTIVE', OR: [{userAId: user.id}, {userBId: user.id}]},
    },
    _count: {_all: true},
  });
  const unreadByMatch = new Map(unreadCounts.map((item) => [item.matchId, item._count._all]));

  return json({
    matches: matches.map((match) => {
      const other = match.userAId === user.id ? match.userB : match.userA;
      return {
        id: match.id,
        status: match.status,
        createdAt: match.createdAt,
        unreadCount: unreadByMatch.get(match.id) ?? 0,
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
