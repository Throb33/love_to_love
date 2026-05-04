import {AppShell} from '@/components/AppShell';
import {AdminReviews} from '@/components/AdminReviews';
import {requireAdmin} from '@/lib/auth';

export default async function AdminReviewsPage() {
  await requireAdmin();

  return (
    <AppShell>
      <h1>资料审核</h1>
      <AdminReviews />
    </AppShell>
  );
}
