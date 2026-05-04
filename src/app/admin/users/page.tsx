import {AppShell} from '@/components/AppShell';
import {AdminUsers} from '@/components/AdminUsers';
import {requireAdmin} from '@/lib/auth';

export default async function AdminUsersPage() {
  await requireAdmin();

  return (
    <AppShell>
      <h1>用户管理</h1>
      <AdminUsers />
    </AppShell>
  );
}
