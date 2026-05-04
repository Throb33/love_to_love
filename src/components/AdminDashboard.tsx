'use client';

import {useEffect, useState} from 'react';

type Overview = {
  users: number;
  pendingReviews: number;
  approved: number;
  approvalRate: number;
  matches: number;
  openReports: number;
};

export function AdminDashboard() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <p className="subtle">加载中...</p>;

  return (
    <div className="grid three">
      <div className="card"><h2>{data.users}</h2><p className="subtle">注册用户</p></div>
      <div className="card"><h2>{data.pendingReviews}</h2><p className="subtle">待审核</p></div>
      <div className="card"><h2>{data.approved}%</h2><p className="subtle">通过用户数</p></div>
      <div className="card"><h2>{data.approvalRate}%</h2><p className="subtle">审核通过率</p></div>
      <div className="card"><h2>{data.matches}</h2><p className="subtle">匹配数</p></div>
      <div className="card"><h2>{data.openReports}</h2><p className="subtle">待处理举报</p></div>
    </div>
  );
}
