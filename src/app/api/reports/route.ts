import {badRequest, forbidden, json, requireApiApprovedUser} from '@/lib/api';
import {prisma} from '@/lib/prisma';

const reportTypes = ['FAKE_PROFILE', 'HARASSMENT', 'ADVERTISING', 'FRAUD_RISK', 'OTHER'];

export async function POST(request: Request) {
  const {user, response} = await requireApiApprovedUser();

  if (response) {
    return response;
  }

  const body = await request.json().catch(() => ({}));
  const reportedUserId = String(body.reportedUserId ?? '').trim();
  const matchId = String(body.matchId ?? '').trim() || null;
  const description = String(body.description ?? '').trim();
  const type = reportTypes.includes(body.type) ? body.type : 'OTHER';

  if (!reportedUserId || !description) {
    return badRequest('请选择举报对象并填写说明');
  }

  if (reportedUserId === user.id) {
    return badRequest('不能举报自己');
  }

  if (description.length < 5 || description.length > 300) {
    return badRequest('举报说明需要 5-300 字');
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentReports = await prisma.report.count({
    where: {reporterId: user.id, createdAt: {gte: oneHourAgo}},
  });

  if (recentReports >= 5) {
    return badRequest('举报提交过于频繁，请稍后再试');
  }

  const duplicateOpen = await prisma.report.findFirst({
    where: {reporterId: user.id, reportedUserId, status: 'OPEN'},
  });

  if (duplicateOpen) {
    return badRequest('你已提交过该用户的举报，管理员正在处理');
  }

  if (matchId) {
    const match = await prisma.match.findUnique({where: {id: matchId}});
    if (!match || (match.userAId !== user.id && match.userBId !== user.id)) {
      return forbidden('无法举报该会话');
    }
    if (reportedUserId !== match.userAId && reportedUserId !== match.userBId) {
      return forbidden('举报对象不属于该会话');
    }
  }

  const report = await prisma.report.create({
    data: {reporterId: user.id, reportedUserId, matchId, type, description},
  });

  return json({ok: true, report});
}
