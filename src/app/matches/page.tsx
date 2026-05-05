import {AppShell} from '@/components/AppShell';
import {MatchesClient} from '@/components/MatchesClient';
import {requireApprovedUser} from '@/lib/auth';

export default async function MatchesPage() {
  await requireApprovedUser();

  return (
    <AppShell>
      <div className="page-heading">
        <span className="eyebrow">Matched</span>
        <h1>我的匹配</h1>
        <p className="subtle">互相喜欢后会出现在这里。点击头像和姓名可以查看对方的部分公开资料。</p>
      </div>
      <MatchesClient />
    </AppShell>
  );
}
