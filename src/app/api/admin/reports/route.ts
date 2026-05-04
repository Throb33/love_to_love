import {json, requireApiAdmin} from '@/lib/api';
import {prisma} from '@/lib/prisma';

export async function GET() {
  const {response} = await requireApiAdmin();

  if (response) {
    return response;
  }

  const reports = await prisma.report.findMany({
    include: {
      reporter: {include: {profile: true}},
      reportedUser: {include: {profile: true}},
      match: {include: {messages: {orderBy: {createdAt: 'desc'}, take: 5}}},
    },
    orderBy: {createdAt: 'desc'},
    take: 100,
  });

  return json({reports});
}
