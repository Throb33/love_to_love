'use client';

import {useEffect, useState} from 'react';

type ReviewUser = {
  id: string;
  phone: string;
  profile: {
    nickname: string;
    city: string;
    education: string;
    occupation: string;
    bio: string;
    avatarUrl: string;
    interests: string[];
  } | null;
};

export function AdminReviews() {
  const [users, setUsers] = useState<ReviewUser[]>([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const res = await fetch('/api/admin/reviews');
    const data = await res.json();
    setUsers(data.users ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (userId: string) => {
    await fetch(`/api/admin/reviews/${userId}/approve`, {method: 'POST'});
    setMessage('已通过');
    load();
  };

  const reject = async (userId: string) => {
    const reason = window.prompt('请输入驳回原因', '资料不完整，请补充后重新提交');
    if (!reason) return;
    await fetch(`/api/admin/reviews/${userId}/reject`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({reason}),
    });
    setMessage('已驳回');
    load();
  };

  return (
    <div className="grid">
      {message ? <p className="status">{message}</p> : null}
      {users.length === 0 ? <div className="panel">暂无待审核资料</div> : null}
      {users.map((user) => (
        <article className="card grid" key={user.id}>
          {user.profile ? (
            <>
              <div className="profile-row">
                <img className="avatar" src={user.profile.avatarUrl} alt="" />
                <div>
                  <h2>{user.profile.nickname}</h2>
                  <p className="subtle">
                    {user.phone} · {user.profile.city} · {user.profile.education} ·{' '}
                    {user.profile.occupation}
                  </p>
                </div>
              </div>
              <p>{user.profile.bio}</p>
              <div className="actions">
                {user.profile.interests.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
              </div>
            </>
          ) : null}
          <div className="actions">
            <button className="button" type="button" onClick={() => approve(user.id)}>通过</button>
            <button className="button ghost" type="button" onClick={() => reject(user.id)}>驳回</button>
          </div>
        </article>
      ))}
    </div>
  );
}
