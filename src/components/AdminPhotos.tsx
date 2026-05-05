'use client';

import {useEffect, useState} from 'react';

type PendingPhoto = {
  id: string;
  url: string;
  createdAt: string;
  user: {
    id: string;
    phone: string;
    nickname: string;
    city: string;
  };
};

export function AdminPhotos() {
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const res = await fetch('/api/admin/photos');
    const data = await res.json();
    setPhotos(data.photos ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (photoId: string) => {
    const res = await fetch(`/api/admin/photos/${photoId}/approve`, {method: 'POST'});
    const data = await res.json();
    setMessage(res.ok ? '照片已通过' : data.error ?? '操作失败');
    load();
  };

  const reject = async (photoId: string) => {
    const reason = window.prompt('请输入照片驳回原因', '照片不符合平台展示规范');
    if (!reason) return;

    const res = await fetch(`/api/admin/photos/${photoId}/reject`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({reason}),
    });
    const data = await res.json();
    setMessage(res.ok ? '照片已驳回' : data.error ?? '操作失败');
    load();
  };

  return (
    <div className="grid">
      {message ? <p className="status">{message}</p> : null}
      {photos.length === 0 ? <div className="panel">暂无待审核照片</div> : null}
      <div className="grid three">
        {photos.map((photo) => (
          <article className="card grid" key={photo.id}>
            <img className="review-photo" src={photo.url} alt="" />
            <div>
              <h2>{photo.user.nickname}</h2>
              <p className="subtle">
                {photo.user.phone}
                {photo.user.city ? ` · ${photo.user.city}` : ''}
              </p>
            </div>
            <div className="actions">
              <button className="button" type="button" onClick={() => approve(photo.id)}>
                通过
              </button>
              <button className="button ghost" type="button" onClick={() => reject(photo.id)}>
                驳回
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
