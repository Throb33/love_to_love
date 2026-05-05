import {ChatClient} from '@/components/ChatClient';
import {requireApprovedUser} from '@/lib/auth';

export default async function ChatPage({params}: {params: Promise<{matchId: string}>}) {
  const user = await requireApprovedUser();
  const {matchId} = await params;

  return (
    <main className="chat-page">
      <ChatClient currentUserAvatar={user.profile?.avatarUrl} currentUserId={user.id} matchId={matchId} />
    </main>
  );
}
