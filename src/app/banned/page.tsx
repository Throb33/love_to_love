import {AppShell} from '@/components/AppShell';

export default function BannedPage() {
  return (
    <AppShell>
      <div className="panel">
        <h1>账号已禁用</h1>
        <p className="subtle">该账号暂时无法使用推荐、匹配和聊天功能。</p>
      </div>
    </AppShell>
  );
}
