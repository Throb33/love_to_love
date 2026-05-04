'use client';

import {useEffect, useState} from 'react';

type Report = {
  id: string;
  type: string;
  description: string;
  status: string;
  reporter: {profile: {nickname: string} | null};
  reportedUser: {id: string; profile: {nickname: string} | null};
};

export function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);

  const load = async () => {
    const res = await fetch('/api/admin/reports');
    const data = await res.json();
    setReports(data.reports ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const resolve = async (reportId: string, banUser: boolean) => {
    await fetch(`/api/admin/reports/${reportId}/resolve`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({adminNote: banUser ? '举报成立，已禁用用户' : '已处理', banUser}),
    });
    load();
  };

  return (
    <div className="grid">
      {reports.length === 0 ? <div className="panel">暂无举报</div> : null}
      {reports.map((report) => (
        <article className="card grid" key={report.id}>
          <h2>{report.reportedUser.profile?.nickname ?? '未知用户'}</h2>
          <p className="subtle">举报人：{report.reporter.profile?.nickname ?? '未知'} · 类型：{report.type} · 状态：{report.status}</p>
          <p>{report.description}</p>
          {report.status === 'OPEN' ? (
            <div className="actions">
              <button className="button ghost" type="button" onClick={() => resolve(report.id, false)}>标记已处理</button>
              <button className="button danger" type="button" onClick={() => resolve(report.id, true)}>处理并禁用</button>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
