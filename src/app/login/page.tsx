import {redirect} from 'next/navigation';
import {AppShell} from '@/components/AppShell';
import {LoginForm} from '@/components/LoginForm';
import {getCurrentUser, statusPath} from '@/lib/auth';

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user?.role === 'ADMIN') {
    redirect('/admin');
  }

  if (user) {
    redirect(statusPath(user.status));
  }

  return (
    <AppShell>
      <div className="split-page">
        <section className="intro-panel">
          <span className="eyebrow">实名资料 · 人工审核 · 站内聊天</span>
          <h1>登录 Love to Love</h1>
          <p className="subtle">用手机号验证码进入平台，完善资料并通过审核后即可查看推荐。</p>
        </section>
        <LoginForm />
      </div>
    </AppShell>
  );
}
