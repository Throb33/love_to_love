import {json, requireApiAdmin} from '@/lib/api';
import {prisma} from '@/lib/prisma';

export async function POST(
  _request: Request,
  context: {params: Promise<{userId: string}>},
) {
  const {response} = await requireApiAdmin();

  if (response) {
    return response;
  }

  const {userId} = await context.params;
  await prisma.user.update({where: {id: userId}, data: {status: 'APPROVED'}});
  return json({ok: true});
}
