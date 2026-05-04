'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState('18600000002');
  const [code, setCode] = useState('123456');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    setMessage('');
    const res = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({phone}),
    });
    const data = await res.json();
    setMessage(data.message ?? data.error);
  };

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({phone, code}),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error ?? '登录失败');
      return;
    }

    router.push(data.redirectTo);
    router.refresh();
  };

  return (
    <form className="panel grid" onSubmit={login}>
      <div className="field">
        <label>手机号</label>
        <input value={phone} onChange={(event) => setPhone(event.target.value)} />
      </div>
      <div className="field">
        <label>验证码</label>
        <input value={code} onChange={(event) => setCode(event.target.value)} />
      </div>
      <div className="actions">
        <button className="button" disabled={loading} type="submit">
          登录
        </button>
        <button className="button ghost" type="button" onClick={sendCode}>
          获取验证码
        </button>
      </div>
      {message ? <p className="subtle">{message}</p> : null}
      <p className="subtle">
        演示验证码固定为 123456。管理员账号：19999999999。
      </p>
    </form>
  );
}
