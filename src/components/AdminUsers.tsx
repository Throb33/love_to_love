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

  const load = async () => {
    const res = await fetch('/api/admin/users');
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
    <div className="panel">
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
                <p className="subtle">{user.phone} · {user.profile?.city ?? '-'} · {user.profile?.occupation ?? '-'}</p>
              </td>
              <td>{user.status}</td>
              <td>{user.reportCount}</td>
              <td>
                {user.status === 'BANNED' ? (
                  <button className="button ghost" type="button" onClick={() => setBan(user.id, false)}>解禁</button>
                ) : (
                  <button className="button danger" type="button" onClick={() => setBan(user.id, true)}>禁用</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
