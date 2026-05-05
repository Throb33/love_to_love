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
    heightCm?: number | null;
    education: string;
    occupation: string;
    avatarUrl: string;
    photos: string[];
    bio: string;
    idealPartner?: string | null;
    interests: string[];
  } | null;
  lastMessage?: {createdAt: string} | null;
};

export function MatchesClient() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [message, setMessage] = useState('');
  const [openProfileId, setOpenProfileId] = useState<string | null>(null);

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
                <>
                  <button
                    className="profile-trigger"
                    type="button"
                    onClick={() => setOpenProfileId((current) => (current === match.id ? null : match.id))}
                  >
                    <span className="profile-row">
                      <img className="avatar" src={match.other.avatarUrl} alt="" />
                      <span>
                        <strong className="profile-title">
                          {match.other.nickname}
                          {match.unreadCount > 0 ? (
                            <span className="unread-badge">{match.unreadCount}</span>
                          ) : null}
                        </strong>
                        <span className="subtle">
                          {match.other.age} 岁 · {match.other.city} · {match.other.occupation}
                        </span>
                      </span>
                    </span>
                  </button>

                  {openProfileId === match.id ? (
                    <div className="profile-detail">
                      <p className="subtle">
                        {match.other.heightCm ? `${match.other.heightCm}cm · ` : ''}
                        {match.other.education} · {match.other.city}
                      </p>
                      <p>{match.other.bio}</p>
                      {match.other.idealPartner ? (
                        <p className="subtle">期待：{match.other.idealPartner}</p>
                      ) : null}
                      {match.other.photos.length > 0 ? (
                        <div className="mini-photo-grid">
                          {match.other.photos.slice(0, 3).map((url) => (
                            <img src={url} alt="" key={url} />
                          ))}
                        </div>
                      ) : null}
                      <div className="actions">
                        {match.other.interests.map((tag) => (
                          <span className="tag" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}

              {match.lastMessage ? (
                <p className="subtle">
                  最后消息：{new Date(match.lastMessage.createdAt).toLocaleString('zh-CN')}
                </p>
              ) : (
                <p className="subtle">还没有消息</p>
              )}

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
