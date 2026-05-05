'use client';

import {useEffect, useState} from 'react';

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt?: string | null;
};

type PendingMessage = {
  content: string;
  error?: string;
};

export function ChatClient({matchId, currentUserId}: {matchId: string; currentUserId: string}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [otherUserId, setOtherUserId] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportType, setReportType] = useState('HARASSMENT');
  const [reportDescription, setReportDescription] = useState('');
  const [canSend, setCanSend] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [pending, setPending] = useState<PendingMessage | null>(null);

  const load = async (mode: 'replace' | 'prepend' = 'replace') => {
    const before = mode === 'prepend' ? messages[0]?.createdAt : '';
    const res = await fetch(`/api/matches/${matchId}/messages${before ? `?before=${encodeURIComponent(before)}` : ''}`);
    const data = await res.json();

    if (!res.ok) {
      setStatus(data.error ?? '加载失败');
      return;
    }

    setOtherUserId(data.otherUserId ?? '');
    setCanSend(Boolean(data.canSend));
    setHasMore(Boolean(data.hasMore));
    setMessages((current) => (mode === 'prepend' ? [...(data.messages ?? []), ...current] : data.messages ?? []));
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(() => load(), 5000);
    return () => window.clearInterval(timer);
  }, [matchId]);

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

  return (
    <div className="grid">
      <div className="actions">
        <button className="button ghost" type="button" onClick={() => setShowReportForm((value) => !value)}>
          举报聊天对象
        </button>
      </div>
      {showReportForm ? (
        <form className="panel grid" onSubmit={submitReport}>
          <div className="form-grid">
            <div className="field">
              <label>举报类型</label>
              <select value={reportType} onChange={(event) => setReportType(event.target.value)}>
                <option value="HARASSMENT">骚扰辱骂</option>
                <option value="FAKE_PROFILE">虚假资料</option>
                <option value="ADVERTISING">广告营销</option>
                <option value="FRAUD_RISK">诈骗风险</option>
                <option value="OTHER">其他</option>
              </select>
            </div>
            <div className="field full">
              <label>举报说明</label>
              <textarea
                minLength={5}
                maxLength={300}
                required
                placeholder="请说明具体问题，管理员会结合聊天上下文处理。"
                value={reportDescription}
                onChange={(event) => setReportDescription(event.target.value)}
              />
            </div>
          </div>
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
      <div className="chat-box">
        {hasMore ? (
          <button className="button ghost" type="button" onClick={() => load('prepend')}>
            加载更早消息
          </button>
        ) : null}
        {messages.length === 0 ? <p className="subtle">还没有消息，先打个招呼。</p> : null}
        {messages.map((message) => (
          <div className={`message ${message.senderId === currentUserId ? 'mine' : ''}`} key={message.id}>
            {message.content}
            {message.senderId === currentUserId ? (
              <small>{message.readAt ? '已读' : '未读'}</small>
            ) : null}
          </div>
        ))}
        {pending ? (
          <div className="message mine pending">
            {pending.content}
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
        ) : null}
      </div>
      <form className="actions" onSubmit={send}>
        <input
          disabled={!canSend}
          maxLength={500}
          placeholder={canSend ? '输入消息，最大 500 字' : '匹配已解除，不能继续发送消息'}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <button className="button" disabled={sending || !canSend} type="submit">
          发送
        </button>
      </form>
      {status ? <p className={status.includes('失败') ? 'error' : 'status'}>{status}</p> : null}
    </div>
  );
}
