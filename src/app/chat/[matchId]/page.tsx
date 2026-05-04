import {AppShell} from '@/components/AppShell';
import {ChatClient} from '@/components/ChatClient';
import {requireApprovedUser} from '@/lib/auth';

export default async function ChatPage({params}: {params: Promise<{matchId: string}>}) {
  const user = await requireApprovedUser();
  const {matchId} = await params;

  return (
    <AppShell>
      <h1>站内聊天</h1>
      <ChatClient currentUserId={user.id} matchId={matchId} />
    </AppShell>
  );
}
