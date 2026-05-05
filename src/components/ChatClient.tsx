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

const topicLabels = ['聊聊兴趣', '周末计划', '理想关系'];

const suggestionsFor = (topic: string, user: ChatUser | null) => {
  const interest = user?.sharedInterests?.[0] ?? user?.interests?.[0] ?? '最近喜欢的事情';
  const name = user?.nickname ?? '你';

  if (topic === '聊聊兴趣') {
    return [
      `看到你也喜欢${interest}，你一般什么时候会去做？`,
      `${interest}里面你最喜欢的是哪一部分？`,
      `如果周末有空，可以听你聊聊${interest}。`,
    ];
  }

  if (topic === '周末计划') {
    return [
      '你周末一般喜欢安静一点，还是出门走走？',
      `你在${user?.city ?? '现在的城市'}有常去的放松地点吗？`,
      '如果安排一次轻松见面，你更喜欢咖啡还是散步？',
    ];
  }

  return [
    `${name}，你理想中的相处节奏是什么样的？`,
    '你觉得一段长期关系里最重要的是什么？',
    '你更看重稳定陪伴，还是一起探索新鲜事？',
  ];
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
  const [showProfile, setShowProfile] = useState(false);
  const [activeTopic, setActiveTopic] = useState('');
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
  }, [messages.length, pending?.content, activeTopic]);

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
    setActiveTopic('');
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
      <div className="match-insight chat-profile-top">
        <Link className="icon-link compact" href="/matches" aria-label="返回匹配列表">
          ‹
        </Link>
        <button className="profile-summary" type="button" onClick={() => setShowProfile(true)}>
          <Avatar className="dating-peer-avatar" src={otherUser?.avatarUrl} />
          <span>
            <strong>{otherUser?.nickname ?? '聊天对象'}</strong>
            <em>
              {otherUser?.age ? `${otherUser.age} 岁` : '已匹配'}
              {otherUser?.city ? ` · ${otherUser.city}` : ''}
            </em>
          </span>
        </button>
        <button className="icon-button compact" type="button" onClick={() => setShowReportForm((value) => !value)}>
          ⋯
        </button>
        <div className="match-score-pill">
          <span>匹配度</span>
          <strong>{otherUser?.compatibilityScore ?? 86}</strong>
        </div>
        <p>共同兴趣：{sharedInterests.length > 0 ? sharedInterests.join('、') : '认真生活、真诚沟通'}</p>
        <em className="verified-pill">已通过资料审核</em>
      </div>

      {showProfile ? (
        <div className="profile-popover">
          <button className="profile-popover-backdrop" type="button" onClick={() => setShowProfile(false)} />
          <article className="profile-popover-card">
            <Avatar className="profile-popover-avatar" src={otherUser?.avatarUrl} />
            <h2>{otherUser?.nickname ?? '聊天对象'}</h2>
            <p className="subtle">
              {otherUser?.age ? `${otherUser.age} 岁` : '已匹配'}
              {otherUser?.city ? ` · ${otherUser.city}` : ''}
            </p>
            <div className="actions">
              {(otherUser?.interests ?? []).slice(0, 5).map((interest) => (
                <span className="tag" key={interest}>
                  {interest}
                </span>
              ))}
            </div>
            <p className="subtle">匹配度 {otherUser?.compatibilityScore ?? 86}，资料已通过平台审核。</p>
            <button className="button" type="button" onClick={() => setShowProfile(false)}>
              继续聊天
            </button>
          </article>
        </div>
      ) : null}

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
                onAvatarClick={!isMine ? () => setShowProfile(true) : undefined}
              />
              {shouldShowTopics ? (
                <>
                  <div className="icebreakers">
                    {topicLabels.map((topic) => (
                      <button
                        className={activeTopic === topic ? 'active' : ''}
                        disabled={!canSend}
                        key={topic}
                        type="button"
                        onClick={() => setActiveTopic(activeTopic === topic ? '' : topic)}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                  {activeTopic ? (
                    <div className="suggestion-panel">
                      {suggestionsFor(activeTopic, otherUser).map((suggestion) => (
                        <button key={suggestion} type="button" onClick={() => setContent(suggestion)}>
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
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
  onAvatarClick,
}: {
  avatarUrl?: string;
  isMine: boolean;
  message: Message;
  onAvatarClick?: () => void;
}) {
  return (
    <div className={`dating-message-row ${isMine ? 'mine' : ''}`}>
      {!isMine ? <AvatarButton src={avatarUrl} onClick={onAvatarClick} /> : null}
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

function AvatarButton({src, onClick}: {src?: string; onClick?: () => void}) {
  return (
    <button className="avatar-button" type="button" onClick={onClick} aria-label="查看用户资料">
      <Avatar className="dating-avatar" src={src} />
    </button>
  );
}
