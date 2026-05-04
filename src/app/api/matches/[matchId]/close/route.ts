import {forbidden, json, requireApiApprovedUser} from '@/lib/api';
import {prisma} from '@/lib/prisma';

export async function POST(
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
    return forbidden('无法操作该匹配');
  }

  await prisma.match.update({
    where: {id: matchId},
    data: {status: 'CLOSED', closedAt: new Date()},
  });

  return json({ok: true});
}
