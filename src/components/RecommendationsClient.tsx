'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';

type Recommendation = {
  id: string;
  score: number;
  age: number;
  profile: {
    nickname: string;
    city: string;
    heightCm?: number;
    education: string;
    occupation: string;
    avatarUrl: string;
    bio: string;
    idealPartner?: string;
    interests: string[];
  };
};

export function RecommendationsClient() {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const res = await fetch('/api/recommendations');
    const data = await res.json();
    setItems(data.recommendations ?? []);
    if (!res.ok) setMessage(data.error ?? '加载失败');
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (userId: string, action: 'like' | 'skip') => {
    const res = await fetch(`/api/recommendations/${userId}/${action}`, {method: 'POST'});
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error ?? '操作失败');
      return;
    }

    setItems((current) => current.filter((item) => item.id !== userId));
    setMessage(data.matched ? '匹配成功，已开启聊天' : action === 'like' ? '已喜欢' : '已跳过');
  };

  const report = async (userId: string) => {
    const description = window.prompt('请填写举报说明');
    if (!description) return;
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({reportedUserId: userId, type: 'OTHER', description}),
    });
    const data = await res.json();
    setMessage(res.ok ? '举报已提交' : data.error ?? '举报失败');
  };

  return (
    <div className="grid">
      <div className="actions">
        <button className="button ghost" type="button" onClick={load}>
          刷新推荐
        </button>
        <Link className="button secondary" href="/matches">
          查看匹配
        </Link>
      </div>
      {message ? <p className="status">{message}</p> : null}
      {items.length === 0 ? (
        <div className="panel">
          <h2>暂无推荐</h2>
          <p className="subtle">可以稍后刷新，或调整资料中的择偶偏好。</p>
        </div>
      ) : (
        <div className="grid two">
          {items.map((item) => (
            <article className="card grid" key={item.id}>
              <div className="profile-row">
                <img className="avatar" src={item.profile.avatarUrl} alt="" />
                <div>
                  <h2>{item.profile.nickname}</h2>
                  <p className="subtle">
                    {item.age} 岁 · {item.profile.city} · {item.profile.education} ·{' '}
                    {item.profile.occupation}
                  </p>
                </div>
              </div>
              <p>{item.profile.bio}</p>
              {item.profile.idealPartner ? (
                <p className="subtle">期待：{item.profile.idealPartner}</p>
              ) : null}
              <div className="actions">
                {item.profile.interests.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
                <span className="tag">匹配分 {item.score}</span>
              </div>
              <div className="actions">
                <button className="button" type="button" onClick={() => act(item.id, 'like')}>
                  喜欢
                </button>
                <button className="button ghost" type="button" onClick={() => act(item.id, 'skip')}>
                  跳过
                </button>
                <button className="button danger" type="button" onClick={() => report(item.id)}>
                  举报
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
