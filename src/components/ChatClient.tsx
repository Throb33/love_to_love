'use client';

import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt?: string | null;
};

type ChatUser = {
  id: string;
  nickname: string;
  avatarUrl: string;
};

type PendingMessage = {
  content: string;
  error?: string;
};

export function ChatClient({
  matchId,
  currentUserId,
  currentUserAvatar,
}: {
  matchId: string;
  currentUserId: string;
  currentUserAvatar?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [otherUserId, setOtherUserId] = useState('');
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportType, setReportType] = useState('HARASSMENT');
  const [reportDescription, setReportDescription] = useState('');
  const [canSend, setCanSend] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [pending, setPending] = useState<PendingMessage | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  const load = async (mode: 'replace' | 'prepend' = 'replace') => {
    const before = mode === 'prepend' ? messages[0]?.createdAt : '';
    const res = await fetch(`/api/matches/${matchId}/messages${before ? `?before=${encodeURIComponent(before)}` : ''}`);
    const data = await res.json();

    if (!res.ok) {
      setStatus(data.error ?? '加载失败');
      return;
    }

    setOtherUserId(data.otherUserId ?? '');
    setOtherUser(data.otherUser ?? null);
    setCanSend(Boolean(data.canSend));
    setHasMore(Boolean(data.hasMore));
    setMessages((current) => (mode === 'prepend' ? [...(data.messages ?? []), ...current] : data.messages ?? []));
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(() => load(), 5000);
    return () => window.clearInterval(timer);
  }, [matchId]);

  useEffect(() => {
    threadRef.current?.scrollTo({top: threadRef.current.scrollHeight});
  }, [messages.length, pending?.content]);

  const sendContent = async (nextContent: string) => {
    setSending(true);
    setPending({content: nextContent});
    const res = await fetch(`/api/matches/${matchId}/messages`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({content: nextContent}),
    });
    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      setPending({content: nextContent, error: data.error ?? '发送失败'});
      return;
    }

    setContent('');
    setPending(null);
    setStatus('');
    load();
  };

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextContent = content.trim();
    if (!nextContent || sending || !canSend) return;
    await sendContent(nextContent);
  };

  const submitReport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!otherUserId) return;

    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        reportedUserId: otherUserId,
        matchId,
        type: reportType,
        description: reportDescription,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error ?? '举报失败');
      return;
    }

    setReportDescription('');
    setShowReportForm(false);
    setStatus('举报已提交');
  };

  const avatarFor = (senderId: string) =>
    senderId === currentUserId ? currentUserAvatar : otherUser?.avatarUrl;

  return (
    <section className="wechat-chat">
      <header className="wechat-header">
        <Link className="wechat-back" href="/matches">
          返回
        </Link>
        <div className="wechat-peer">
          {otherUser?.avatarUrl ? <img src={otherUser.avatarUrl} alt="" /> : <span />}
          <div>
            <strong>{otherUser?.nickname ?? '站内聊天'}</strong>
            <small>{canSend ? '匹配后可聊天' : '匹配已解除'}</small>
          </div>
        </div>
        <button className="wechat-report" type="button" onClick={() => setShowReportForm((value) => !value)}>
          举报
        </button>
      </header>

      {showReportForm ? (
        <form className="wechat-report-form" onSubmit={submitReport}>
          <select value={reportType} onChange={(event) => setReportType(event.target.value)}>
            <option value="HARASSMENT">骚扰辱骂</option>
            <option value="FAKE_PROFILE">虚假资料</option>
            <option value="ADVERTISING">广告营销</option>
            <option value="FRAUD_RISK">诈骗风险</option>
            <option value="OTHER">其他</option>
          </select>
          <textarea
            minLength={5}
            maxLength={300}
            required
            placeholder="请说明具体问题，管理员会结合聊天上下文处理。"
            value={reportDescription}
            onChange={(event) => setReportDescription(event.target.value)}
          />
          <div className="actions">
            <button className="button danger" type="submit">
              提交举报
            </button>
            <button className="button ghost" type="button" onClick={() => setShowReportForm(false)}>
              取消
            </button>
          </div>
        </form>
      ) : null}

      <div className="wechat-thread" ref={threadRef}>
        {hasMore ? (
          <button className="wechat-load-more" type="button" onClick={() => load('prepend')}>
            查看更早消息
          </button>
        ) : null}
        {messages.length === 0 ? <p className="wechat-empty">还没有消息，先打个招呼。</p> : null}
        {messages.map((message) => {
          const isMine = message.senderId === currentUserId;
          return (
            <div className={`wechat-row ${isMine ? 'mine' : ''}`} key={message.id}>
              {!isMine ? <Avatar src={avatarFor(message.senderId)} /> : null}
              <div className="wechat-bubble">
                <p>{message.content}</p>
                {isMine ? <small>{message.readAt ? '已读' : '未读'}</small> : null}
              </div>
              {isMine ? <Avatar src={avatarFor(message.senderId)} /> : null}
            </div>
          );
        })}
        {pending ? (
          <div className="wechat-row mine">
            <div className="wechat-bubble pending">
              <p>{pending.content}</p>
              <small>
                {pending.error ? (
                  <>
                    {pending.error}
                    <button className="inline-action" type="button" onClick={() => sendContent(pending.content)}>
                      重试
                    </button>
                  </>
                ) : (
                  '发送中...'
                )}
              </small>
            </div>
            <Avatar src={currentUserAvatar} />
          </div>
        ) : null}
      </div>

      <form className="wechat-inputbar" onSubmit={send}>
        <input
          disabled={!canSend}
          maxLength={500}
          placeholder={canSend ? '输入消息' : '匹配已解除，不能继续发送消息'}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <button disabled={sending || !canSend || !content.trim()} type="submit">
          发送
        </button>
      </form>
      {status ? <p className={status.includes('失败') ? 'error chat-status' : 'status chat-status'}>{status}</p> : null}
    </section>
  );
}

function Avatar({src}: {src?: string}) {
  return src ? <img className="wechat-avatar" src={src} alt="" /> : <span className="wechat-avatar" />;
}
