import Link from 'next/link';
import {getCurrentUser} from '@/lib/auth';

export async function AppShell({children}: {children: React.ReactNode}) {
  const user = await getCurrentUser();

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" href="/">
            <span className="brand-mark">L</span>
            <span>Love to Love</span>
          </Link>
          <nav className="nav">
            {user?.role === 'ADMIN' ? (
              <>
                <Link href="/admin">概览</Link>
                <Link href="/admin/reviews">资料审核</Link>
                <Link href="/admin/photos">照片审核</Link>
                <Link href="/admin/users">用户管理</Link>
                <Link href="/admin/reports">举报</Link>
              </>
            ) : user ? (
              <>
                <Link href="/matches/recommendations">推荐</Link>
                <Link href="/matches">匹配</Link>
                <Link href="/me">我的资料</Link>
              </>
            ) : null}
            {user ? (
              <form action="/api/auth/logout" method="post">
                <button className="link-button" type="submit">
                  退出
                </button>
              </form>
            ) : (
              <Link href="/login">登录</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}
