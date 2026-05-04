import {AppShell} from '@/components/AppShell';
import {requireUser} from '@/lib/auth';

export default async function ReviewingPage() {
  await requireUser();

  return (
    <AppShell>
      <div className="panel">
        <h1>资料审核中</h1>
        <p className="subtle">管理员审核通过后，你就可以查看推荐并开始匹配。</p>
      </div>
    </AppShell>
  );
}
