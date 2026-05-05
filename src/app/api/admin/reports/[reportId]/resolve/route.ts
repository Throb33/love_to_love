import {json, requireApiAdmin} from '@/lib/api';
import {prisma} from '@/lib/prisma';

export async function POST(
  request: Request,
  context: {params: Promise<{reportId: string}>},
) {
  const {user: admin, response} = await requireApiAdmin();

  if (response) {
    return response;
  }

  const body = await request.json().catch(() => ({}));
  const adminNote = String(body.adminNote ?? '').trim() || '已处理';
  const banUser = Boolean(body.banUser);
  const {reportId} = await context.params;
  const report = await prisma.report.findUnique({where: {id: reportId}});

  if (!report) {
    return json({error: '举报不存在'}, {status: 404});
  }

  await prisma.$transaction([
    prisma.report.update({
      where: {id: reportId},
      data: {status: 'RESOLVED', adminNote, resolvedAt: new Date()},
    }),
    prisma.moderationLog.create({
      data: {
        actorId: admin.id,
        targetUserId: report.reportedUserId,
        action: 'REPORT_RESOLVED',
        note: adminNote,
        metadata: JSON.stringify({reportId, banUser}),
      },
    }),
    ...(banUser
      ? [
          prisma.user.update({
            where: {id: report.reportedUserId},
            data: {status: 'BANNED'},
          }),
          prisma.moderationLog.create({
            data: {
              actorId: admin.id,
              targetUserId: report.reportedUserId,
              action: 'USER_BANNED' as const,
              note: `举报处理触发封禁：${adminNote}`,
              metadata: JSON.stringify({reportId}),
            },
          }),
        ]
      : []),
  ]);

  return json({ok: true});
}
