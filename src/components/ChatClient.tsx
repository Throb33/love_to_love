'use client';

import {useEffect, useState} from 'react';

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export function ChatClient({matchId, currentUserId}: {matchId: string; currentUserId: string}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');

  const load = async () => {
    const res = await fetch(`/api/matches/${matchId}/messages`);
    const data = await res.json();
    setMessages(data.messages ?? []);
    if (!res.ok) setStatus(data.error ?? '加载失败');
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 5000);
    return () => window.clearInterval(timer);
  }, [matchId]);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const res = await fetch(`/api/matches/${matchId}/messages`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({content}),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error ?? '发送失败');
      return;
    }
    setContent('');
    setStatus('');
    load();
  };

  return (
    <div className="grid">
      <div className="chat-box">
        {messages.length === 0 ? <p className="subtle">还没有消息，先打个招呼。</p> : null}
        {messages.map((message) => (
          <div className={`message ${message.senderId === currentUserId ? 'mine' : ''}`} key={message.id}>
            {message.content}
          </div>
        ))}
      </div>
      <form className="actions" onSubmit={send}>
        <input
          maxLength={500}
          placeholder="输入消息，最多 500 字"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <button className="button" type="submit">
          发送
        </button>
      </form>
      {status ? <p className="error">{status}</p> : null}
    </div>
  );
}
