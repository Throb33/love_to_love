import {badRequest, json, requireApiAdmin} from '@/lib/api';
import {prisma} from '@/lib/prisma';

export async function POST(
  request: Request,
  context: {params: Promise<{userId: string}>},
) {
  const {user: admin, response} = await requireApiAdmin();

  if (response) {
    return response;
  }

  const body = await request.json().catch(() => ({}));
  const reason = String(body.reason ?? '').trim();

  if (!reason) {
    return badRequest('请填写驳回原因');
  }

  const {userId} = await context.params;
  await prisma.$transaction([
    prisma.user.update({where: {id: userId}, data: {status: 'REJECTED'}}),
    prisma.reviewRecord.create({
      data: {userId, reviewerId: admin.id, result: 'REJECTED', reason},
    }),
  ]);

  return json({ok: true});
}
