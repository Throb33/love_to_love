import {badRequest, forbidden, json, requireApiApprovedUser} from '@/lib/api';
import {prisma} from '@/lib/prisma';

export async function POST(request: Request) {
  const {user, response} = await requireApiApprovedUser();

  if (response) {
    return response;
  }

  const body = await request.json().catch(() => ({}));
  const reportedUserId = String(body.reportedUserId ?? '').trim();
  const matchId = String(body.matchId ?? '').trim() || null;
  const description = String(body.description ?? '').trim();
  const type = ['FAKE_PROFILE', 'HARASSMENT', 'ADVERTISING', 'FRAUD_RISK', 'OTHER'].includes(body.type)
    ? body.type
    : 'OTHER';

  if (!reportedUserId || !description) {
    return badRequest('请选择举报对象并填写说明');
  }

  if (matchId) {
    const match = await prisma.match.findUnique({where: {id: matchId}});
    if (!match || (match.userAId !== user.id && match.userBId !== user.id)) {
      return forbidden('无法举报该会话');
    }
  }

  const report = await prisma.report.create({
    data: {reporterId: user.id, reportedUserId, matchId, type, description},
  });

  return json({ok: true, report});
}
