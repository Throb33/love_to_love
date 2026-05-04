import {badRequest, forbidden, json, requireApiApprovedUser} from '@/lib/api';
import {prisma} from '@/lib/prisma';

export async function GET(
  _request: Request,
  context: {params: Promise<{matchId: string}>},
) {
  const {user, response} = await requireApiApprovedUser();

  if (response) {
    return response;
  }

  const {matchId} = await context.params;
  const match = await prisma.match.findUnique({where: {id: matchId}});

  if (!match || (match.userAId !== user.id && match.userBId !== user.id)) {
    return forbidden('无法查看该聊天');
  }

  const messages = await prisma.message.findMany({
    where: {matchId},
    orderBy: {createdAt: 'asc'},
    take: 30,
  });

  return json({match, messages});
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
    return badRequest('消息不能为空，且最多 500 字');
  }

  const match = await prisma.match.findUnique({where: {id: matchId}});

  if (
    !match ||
    match.status !== 'ACTIVE' ||
    (match.userAId !== user.id && match.userBId !== user.id)
  ) {
    return forbidden('只有有效匹配双方可以发送消息');
  }

  const message = await prisma.message.create({
    data: {matchId, senderId: user.id, content},
  });

  return json({ok: true, message});
}
