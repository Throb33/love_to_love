import {badRequest, forbidden, json, requireApiApprovedUser} from '@/lib/api';
import {prisma} from '@/lib/prisma';

const sensitiveWords = ['诈骗', '转账', '博彩', '裸聊', '贷款', '加群'];

export async function GET(
  request: Request,
  context: {params: Promise<{matchId: string}>},
) {
  const {user, response} = await requireApiApprovedUser();

  if (response) {
    return response;
  }

  const {matchId} = await context.params;
  const match = await prisma.match.findUnique({
    where: {id: matchId},
    include: {
      userA: {include: {profile: true}},
      userB: {include: {profile: true}},
    },
  });

  if (!match || (match.userAId !== user.id && match.userBId !== user.id)) {
    return forbidden('无法查看该聊天');
  }

  await prisma.message.updateMany({
    where: {matchId, senderId: {not: user.id}, readAt: null},
    data: {readAt: new Date()},
  });

  const url = new URL(request.url);
  const before = url.searchParams.get('before');
  const rows = await prisma.message.findMany({
    where: {
      matchId,
      ...(before ? {createdAt: {lt: new Date(before)}} : {}),
    },
    orderBy: {createdAt: 'desc'},
    take: 30,
  });
  const messages = rows.reverse();

  const other = match.userAId === user.id ? match.userB : match.userA;

  return json({
    match,
    otherUserId: other.id,
    otherUser: other.profile
      ? {
          id: other.id,
          nickname: other.profile.nickname,
          avatarUrl: other.profile.avatarUrl,
        }
      : {id: other.id, nickname: '聊天对象', avatarUrl: ''},
    canSend: match.status === 'ACTIVE',
    hasMore: rows.length === 30,
    messages,
  });
}

export async function POST(
  request: Request,
  context: {params: Promise<{matchId: string}>},
) {
  const {user, response} = await requireApiApprovedUser();

  if (response) {
    return response;
  }

  const {matchId} = await context.params;
  const body = await request.json().catch(() => ({}));
  const content = String(body.content ?? '').trim();

  if (!content || content.length > 500) {
    return badRequest('消息不能为空，且最大 500 字');
  }

  if (sensitiveWords.some((word) => content.includes(word))) {
    await prisma.moderationLog.create({
      data: {
        actorId: user.id,
        action: 'MESSAGE_BLOCKED',
        note: '消息命中高风险词',
        metadata: JSON.stringify({matchId}),
      },
    });
    return badRequest('消息包含高风险词汇，请修改后再发送');
  }

  const match = await prisma.match.findUnique({where: {id: matchId}});

  if (
    !match ||
    match.status !== 'ACTIVE' ||
    (match.userAId !== user.id && match.userBId !== user.id)
  ) {
    return forbidden('只有有效匹配双方可以发送消息');
  }

  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentCount = await prisma.message.count({
    where: {
      matchId,
      senderId: user.id,
      createdAt: {gte: oneMinuteAgo},
    },
  });

  if (recentCount >= 10) {
    return badRequest('发送过于频繁，请稍后再试');
  }

  const message = await prisma.message.create({
    data: {matchId, senderId: user.id, content},
  });

  return json({ok: true, message});
}
