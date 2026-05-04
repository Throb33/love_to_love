import {AppShell} from '@/components/AppShell';
import {AdminReports} from '@/components/AdminReports';
import {requireAdmin} from '@/lib/auth';

export default async function AdminReportsPage() {
  await requireAdmin();

  return (
    <AppShell>
      <h1>举报处理</h1>
      <AdminReports />
    </AppShell>
  );
}
