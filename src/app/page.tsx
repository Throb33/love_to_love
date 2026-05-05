import Link from 'next/link';
import {redirect} from 'next/navigation';
import {AppShell} from '@/components/AppShell';
import {getCurrentUser, statusPath} from '@/lib/auth';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user?.role === 'ADMIN') {
    redirect('/admin');
  }

  if (user) {
    redirect(statusPath(user.status));
  }

  return (
    <AppShell>
      <section className="hero">
        <div className="hero-content">
          <h1>Love to Love</h1>
          <p>真实资料审核、清晰推荐理由和匹配后聊天，让每一次认识都更认真。</p>
          <div className="actions">
            <Link className="button" href="/login">
              开始使用
            </Link>
            <Link className="button ghost light" href="/login">
              管理员入口
            </Link>
          </div>
          <div className="hero-tags">
            <span>资料审核</span>
            <span>推荐评分</span>
            <span>匹配聊天</span>
            <span>举报风控</span>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
