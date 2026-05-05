'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';

type Match = {
  id: string;
  unreadCount: number;
  other: {
    id: string;
    nickname: string;
    age: number;
    city: string;
    occupation: string;
    avatarUrl: string;
    interests: string[];
  } | null;
  lastMessage?: {content: string; createdAt: string} | null;
};

export function MatchesClient() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const res = await fetch('/api/matches');
    const data = await res.json();
    setMatches(data.matches ?? []);
    if (!res.ok) setMessage(data.error ?? '加载失败');
  };

  useEffect(() => {
    load();
  }, []);

  const close = async (matchId: string) => {
    const res = await fetch(`/api/matches/${matchId}/close`, {method: 'POST'});
    const data = await res.json();
    setMessage(res.ok ? '已解除匹配' : data.error ?? '操作失败');
    load();
  };

  return (
    <div className="grid">
      {message ? <p className="status">{message}</p> : null}
      {matches.length === 0 ? (
        <div className="panel">
          <h2>还没有匹配</h2>
          <p className="subtle">去推荐页喜欢合适的人，互相喜欢后会出现在这里。</p>
          <Link className="button" href="/matches/recommendations">
            去看推荐
          </Link>
        </div>
      ) : (
        <div className="grid two">
          {matches.map((match) => (
            <article className="card grid" key={match.id}>
              {match.other ? (
                <div className="profile-row">
                  <img className="avatar" src={match.other.avatarUrl} alt="" />
                  <div>
                    <h2>
                      {match.other.nickname}
                      {match.unreadCount > 0 ? (
                        <span className="unread-badge">{match.unreadCount}</span>
                      ) : null}
                    </h2>
                    <p className="subtle">
                      {match.other.age} 岁 · {match.other.city} · {match.other.occupation}
                    </p>
                  </div>
                </div>
              ) : null}
              <p>{match.lastMessage?.content ?? '还没有消息'}</p>
              {match.lastMessage ? (
                <p className="subtle">
                  最后消息：{new Date(match.lastMessage.createdAt).toLocaleString('zh-CN')}
                </p>
              ) : null}
              <div className="actions">
                <Link className="button" href={`/chat/${match.id}`}>
                  进入聊天
                </Link>
                <button className="button ghost" type="button" onClick={() => close(match.id)}>
                  解除匹配
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
