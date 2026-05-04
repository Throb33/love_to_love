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
      <div className="grid two">
        <div>
          <h1>登录 Love to Love</h1>
          <p className="subtle">开发环境使用固定验证码，方便快速体验完整 MVP 流程。</p>
        </div>
        <LoginForm />
      </div>
    </AppShell>
  );
}
