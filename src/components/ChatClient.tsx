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
  age?: number;
  city?: string;
  interests?: string[];
  sharedInterests?: string[];
  compatibilityScore?: number;
};

type PendingMessage = {
  content: string;
  error?: string;
};

const topicPrompts = [
  {label: '聊聊兴趣', text: '看到我们有共同兴趣，平时你最常做的是哪一个？'},
  {label: '周末计划', text: '你周末一般喜欢怎么安排？'},
  {label: '理想关系', text: '你理想中的相处状态是什么样的？'},
];

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
  const sharedInterests = otherUser?.sharedInterests?.length
    ? otherUser.sharedInterests.slice(0, 2)
    : otherUser?.interests?.slice(0, 2) ?? [];

  return (
    <section className="dating-chat">
      <header className="dating-chat-header">
        <Link className="icon-link" href="/matches" aria-label="返回匹配列表">
          ‹
        </Link>
        <div className="dating-peer">
          <Avatar className="dating-peer-avatar" src={otherUser?.avatarUrl} />
          <div>
            <strong>{otherUser?.nickname ?? '聊天对象'}</strong>
            <span>
              {otherUser?.age ? `${otherUser.age} 岁` : '已匹配'}
              {otherUser?.city ? ` · ${otherUser.city}` : ''}
            </span>
          </div>
        </div>
        <button className="icon-button" type="button" onClick={() => setShowReportForm((value) => !value)} aria-label="更多">
          ⋯
        </button>
      </header>

      <div className="match-insight">
        <div>
          <span>匹配度</span>
          <strong>{otherUser?.compatibilityScore ?? 86}</strong>
        </div>
        <p>共同兴趣：{sharedInterests.length > 0 ? sharedInterests.join('、') : '认真生活、真诚沟通'}</p>
        <em>已通过资料审核</em>
      </div>

      {showReportForm ? (
        <form className="dating-report-form" onSubmit={submitReport}>
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

      <div className="dating-thread" ref={threadRef}>
        {hasMore ? (
          <button className="thread-load-more" type="button" onClick={() => load('prepend')}>
            查看更早消息
          </button>
        ) : null}
        {messages.length === 0 ? <p className="thread-empty">还没有消息，先打个招呼。</p> : null}
        {messages.map((message, index) => {
          const isMine = message.senderId === currentUserId;
          const shouldShowTopics = index === 1 && messages.length > 2;

          return (
            <div key={message.id}>
              <MessageRow
                avatarUrl={avatarFor(message.senderId)}
                isMine={isMine}
                message={message}
              />
              {shouldShowTopics ? (
                <div className="icebreakers">
                  {topicPrompts.map((topic) => (
                    <button
                      disabled={!canSend}
                      key={topic.label}
                      type="button"
                      onClick={() => setContent(topic.text)}
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
        {pending ? (
          <div className="dating-message-row mine">
            <div className="dating-bubble pending">
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
            <Avatar className="dating-avatar" src={currentUserAvatar} />
          </div>
        ) : null}
      </div>

      <form className="dating-inputbar" onSubmit={send}>
        <button className="input-plus" disabled={!canSend} type="button" aria-label="更多输入方式">
          +
        </button>
        <input
          disabled={!canSend}
          maxLength={500}
          placeholder={canSend ? '说点什么...' : '匹配已解除，不能继续发送消息'}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <button className="send-button" disabled={sending || !canSend || !content.trim()} type="submit">
          发送
        </button>
      </form>
      {status ? <p className={status.includes('失败') ? 'error chat-status' : 'status chat-status'}>{status}</p> : null}
    </section>
  );
}

function MessageRow({
  avatarUrl,
  isMine,
  message,
}: {
  avatarUrl?: string;
  isMine: boolean;
  message: Message;
}) {
  return (
    <div className={`dating-message-row ${isMine ? 'mine' : ''}`}>
      {!isMine ? <Avatar className="dating-avatar" src={avatarUrl} /> : null}
      <div className="dating-bubble">
        <p>{message.content}</p>
        {isMine ? <small>{message.readAt ? '已读' : '未读'}</small> : null}
      </div>
      {isMine ? <Avatar className="dating-avatar" src={avatarUrl} /> : null}
    </div>
  );
}

function Avatar({src, className}: {src?: string; className: string}) {
  return src ? <img className={className} src={src} alt="" /> : <span className={className} />;
}
