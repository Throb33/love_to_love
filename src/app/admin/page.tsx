import {AppShell} from '@/components/AppShell';
import {AdminDashboard} from '@/components/AdminDashboard';
import {requireAdmin} from '@/lib/auth';

export default async function AdminPage() {
  await requireAdmin();

  return (
    <AppShell>
      <h1>后台概览</h1>
      <AdminDashboard />
    </AppShell>
  );
}
