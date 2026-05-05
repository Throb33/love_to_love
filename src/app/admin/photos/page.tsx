import {AppShell} from '@/components/AppShell';
import {AdminPhotos} from '@/components/AdminPhotos';
import {requireAdmin} from '@/lib/auth';

export default async function AdminPhotosPage() {
  await requireAdmin();

  return (
    <AppShell>
      <h1>照片审核</h1>
      <p className="subtle">用户新上传的相册照片通过后才会对外展示。</p>
      <AdminPhotos />
    </AppShell>
  );
}
