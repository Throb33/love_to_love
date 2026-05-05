'use client';

import {useEffect, useState} from 'react';

type AdminUser = {
  id: string;
  phone: string;
  status: string;
  reportCount: number;
  profile: {nickname: string; city: string; occupation: string} | null;
};

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  const load = async () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (status) params.set('status', status);
    const res = await fetch(`/api/admin/users?${params.toString()}`);
    const data = await res.json();
    setUsers(data.users ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const setBan = async (userId: string, banned: boolean) => {
    await fetch(`/api/admin/users/${userId}/${banned ? 'ban' : 'unban'}`, {method: 'POST'});
    load();
  };

  return (
    <div className="panel grid">
      <div className="actions">
        <input placeholder="搜索手机号、昵称或城市" value={q} onChange={(event) => setQ(event.target.value)} />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">全部状态</option>
          <option value="DRAFT">草稿</option>
          <option value="PENDING_REVIEW">待审核</option>
          <option value="APPROVED">已通过</option>
          <option value="REJECTED">已驳回</option>
          <option value="BANNED">已禁用</option>
        </select>
        <button className="button ghost" type="button" onClick={load}>
          筛选
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>用户</th>
            <th>状态</th>
            <th>举报</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <strong>{user.profile?.nickname ?? '未建档'}</strong>
                <p className="subtle">
                  {user.phone} · {user.profile?.city ?? '-'} · {user.profile?.occupation ?? '-'}
                </p>
              </td>
              <td>{user.status}</td>
              <td>{user.reportCount}</td>
              <td>
                {user.status === 'BANNED' ? (
                  <button className="button ghost" type="button" onClick={() => setBan(user.id, false)}>
                    解禁
                  </button>
                ) : (
                  <button className="button danger" type="button" onClick={() => setBan(user.id, true)}>
                    禁用
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
