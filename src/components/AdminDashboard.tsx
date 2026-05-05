'use client';

import {useEffect, useState} from 'react';

type Overview = {
  users: number;
  pendingReviews: number;
  pendingPhotos: number;
  approved: number;
  activeUsers: number;
  approvalRate: number;
  matches: number;
  openReports: number;
  reportRate: number;
};

export function AdminDashboard() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <p className="subtle">加载中...</p>;

  const cards = [
    ['注册用户', data.users],
    ['7 日活跃用户', data.activeUsers],
    ['待资料审核', data.pendingReviews],
    ['待照片审核', data.pendingPhotos],
    ['通过用户', data.approved],
    ['审核通过率', `${data.approvalRate}%`],
    ['有效匹配', data.matches],
    ['待处理举报', data.openReports],
    ['用户举报率', `${data.reportRate}%`],
  ];

  return (
    <div className="grid three">
      {cards.map(([label, value]) => (
        <div className="card" key={label}>
          <h2>{value}</h2>
          <p className="subtle">{label}</p>
        </div>
      ))}
    </div>
  );
}
