import {AppShell} from '@/components/AppShell';
import {MatchesClient} from '@/components/MatchesClient';
import {requireApprovedUser} from '@/lib/auth';

export default async function MatchesPage() {
  await requireApprovedUser();

  return (
    <AppShell>
      <h1>我的匹配</h1>
      <MatchesClient />
    </AppShell>
  );
}
