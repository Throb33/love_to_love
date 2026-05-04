import {json, requireApiAdmin} from '@/lib/api';
import {prisma} from '@/lib/prisma';

export async function POST(
  request: Request,
  context: {params: Promise<{reportId: string}>},
) {
  const {response} = await requireApiAdmin();

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
    ...(banUser
      ? [
          prisma.user.update({
            where: {id: report.reportedUserId},
            data: {status: 'BANNED'},
          }),
        ]
      : []),
  ]);

  return json({ok: true});
}
