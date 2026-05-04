import {json, requireApiAdmin} from '@/lib/api';
import {prisma} from '@/lib/prisma';

export async function GET() {
  const {response} = await requireApiAdmin();

  if (response) {
    return response;
  }

  const [users, pendingReviews, approved, matches, openReports] = await Promise.all([
    prisma.user.count({where: {role: 'USER'}}),
    prisma.user.count({where: {status: 'PENDING_REVIEW'}}),
    prisma.user.count({where: {status: 'APPROVED', role: 'USER'}}),
    prisma.match.count(),
    prisma.report.count({where: {status: 'OPEN'}}),
  ]);

  return json({
    users,
    pendingReviews,
    approved,
    approvalRate: users === 0 ? 0 : Math.round((approved / users) * 100),
    matches,
    openReports,
  });
}
