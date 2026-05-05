import {json, requireApiAdmin} from '@/lib/api';
import {prisma} from '@/lib/prisma';

export async function GET() {
  const {response} = await requireApiAdmin();

  if (response) {
    return response;
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [users, pendingReviews, pendingPhotos, approved, activeUsers, matches, openReports, reports] = await Promise.all([
    prisma.user.count({where: {role: 'USER'}}),
    prisma.user.count({where: {status: 'PENDING_REVIEW'}}),
    prisma.profilePhoto.count({where: {status: 'PENDING'}}),
    prisma.user.count({where: {status: 'APPROVED', role: 'USER'}}),
    prisma.user.count({where: {role: 'USER', lastActiveAt: {gte: sevenDaysAgo}}}),
    prisma.match.count({where: {status: 'ACTIVE'}}),
    prisma.report.count({where: {status: 'OPEN'}}),
    prisma.report.count(),
  ]);

  return json({
    users,
    pendingReviews,
    pendingPhotos,
    approved,
    activeUsers,
    approvalRate: users === 0 ? 0 : Math.round((approved / users) * 100),
    matches,
    openReports,
    reportRate: users === 0 ? 0 : Math.round((reports / users) * 100),
  });
}
