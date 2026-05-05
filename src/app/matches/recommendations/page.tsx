import {AppShell} from '@/components/AppShell';
import {RecommendationsClient} from '@/components/RecommendationsClient';
import {requireApprovedUser} from '@/lib/auth';

export default async function RecommendationsPage() {
  await requireApprovedUser();

  return (
    <AppShell>
      <div className="page-heading">
        <span className="eyebrow">Today</span>
        <h1>今日推荐</h1>
        <p className="subtle">系统会排除未审核、已跳过、已匹配和不符合双方基础偏好的用户。</p>
      </div>
      <RecommendationsClient />
    </AppShell>
  );
}
