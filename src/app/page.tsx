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
        <div>
          <h1>真实资料，高效遇见合适的人</h1>
          <p>
            面向城市白领的相亲 Web 平台。完成资料审核后，系统会根据择偶偏好、城市、
            学历、兴趣和活跃度推荐对象，双方互相喜欢后开启站内聊天。
          </p>
          <div className="actions">
            <Link className="button" href="/login">
              开始使用
            </Link>
            <Link className="button ghost" href="/login">
              管理员入口
            </Link>
          </div>
        </div>
        <div className="panel grid">
          <h2>MVP 闭环</h2>
          <p className="subtle">手机号登录、资料填写、人工审核、条件推荐、互相喜欢、文字聊天、举报处理。</p>
          <div className="grid two">
            <span className="tag">城市白领</span>
            <span className="tag">资料审核</span>
            <span className="tag">匹配打分</span>
            <span className="tag">站内聊天</span>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
