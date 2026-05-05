'use client';

import {useRouter} from 'next/navigation';
import {useState} from 'react';

type ProfileState = {
  nickname: string;
  gender: 'MALE' | 'FEMALE';
  birthYear: number;
  city: string;
  heightCm: number;
  education: string;
  occupation: string;
  incomeRange: string;
  maritalStatus: string;
  bio: string;
  idealPartner: string;
  avatarUrl: string;
  photos: string;
  interests: string;
  minAge: number;
  maxAge: number;
  preferredCities: string;
  minHeightCm: number;
  maxHeightCm: number;
  educationRequirement: string;
  maritalStatuses: string;
  visibleInRecommend: boolean;
};

const cityOptions = ['上海', '北京', '深圳', '广州', '杭州', '南京', '苏州', '成都', '武汉'];
const educationOptions = ['大专', '本科', '硕士', '博士'];
const maritalOptions = ['未婚', '离异', '丧偶'];

const splitList = (value: string) =>
  value
    .split(/[,，、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

const uploadImages = async (files: FileList | null) => {
  if (!files || files.length === 0) {
    return [];
  }

  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('files', file));

  const res = await fetch('/api/uploads', {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? '上传失败');
  }

  return data.urls as string[];
};

export function ProfileForm({initial}: {initial?: Partial<ProfileState>}) {
  const router = useRouter();
  const [form, setForm] = useState<ProfileState>({
    nickname: '',
    gender: 'MALE',
    birthYear: 1992,
    city: '上海',
    heightCm: 178,
    education: '本科',
    occupation: '',
    incomeRange: '30-50万',
    maritalStatus: '未婚',
    bio: '',
    idealPartner: '',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Love',
    photos: '',
    interests: '咖啡,电影,旅行',
    minAge: 24,
    maxAge: 38,
    preferredCities: '上海,杭州',
    minHeightCm: 155,
    maxHeightCm: 190,
    educationRequirement: '本科',
    maritalStatuses: '未婚',
    visibleInRecommend: true,
    ...initial,
  });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (key: keyof ProfileState, value: string | number | boolean) => {
    setForm((current) => ({...current, [key]: value}));
  };

  const photoList = splitList(form.photos).slice(0, 6);

  const uploadAvatar = async (files: FileList | null) => {
    try {
      setMessage('头像上传中...');
      const urls = await uploadImages(files);
      if (urls[0]) {
        update('avatarUrl', urls[0]);
        setMessage('头像已上传，保存后如影响展示资料会进入资料审核');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '头像上传失败');
    }
  };

  const uploadAlbum = async (files: FileList | null) => {
    try {
      setMessage('相册上传中...');
      const urls = await uploadImages(files);
      const nextPhotos = [...photoList, ...urls].slice(0, 6).join(',');
      update('photos', nextPhotos);
      setMessage('相册已更新，保存后新照片会进入照片审核');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '相册上传失败');
    }
  };

  const removePhoto = (url: string) => {
    update(
      'photos',
      photoList.filter((item) => item !== url).join(','),
    );
    setMessage('相册已修改，保存后生效');
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/profile/me', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    setMessage(res.ok ? data.message ?? '资料已保存' : data.error ?? '保存失败');
    return res.ok;
  };

  const submit = async () => {
    const ok = await save();
    if (!ok) return;
    const res = await fetch('/api/profile/submit-review', {method: 'POST'});
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? '提交失败');
      return;
    }
    router.push(data.redirectTo);
    router.refresh();
  };

  return (
    <div className="panel grid">
      <div className="form-grid">
        <div className="field">
          <label>昵称</label>
          <input value={form.nickname} onChange={(event) => update('nickname', event.target.value)} />
        </div>
        <div className="field">
          <label>性别</label>
          <select value={form.gender} onChange={(event) => update('gender', event.target.value)}>
            <option value="MALE">男</option>
            <option value="FEMALE">女</option>
          </select>
        </div>
        <div className="field">
          <label>出生年份</label>
          <input
            max={2008}
            min={1946}
            type="number"
            value={form.birthYear}
            onChange={(event) => update('birthYear', Number(event.target.value))}
          />
        </div>
        <div className="field">
          <label>所在城市</label>
          <select value={form.city} onChange={(event) => update('city', event.target.value)}>
            {cityOptions.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>身高 cm</label>
          <input
            max={230}
            min={120}
            type="number"
            value={form.heightCm}
            onChange={(event) => update('heightCm', Number(event.target.value))}
          />
        </div>
        <div className="field">
          <label>学历</label>
          <select value={form.education} onChange={(event) => update('education', event.target.value)}>
            {educationOptions.map((education) => (
              <option key={education}>{education}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>职业</label>
          <input value={form.occupation} onChange={(event) => update('occupation', event.target.value)} />
        </div>
        <div className="field">
          <label>收入区间</label>
          <input value={form.incomeRange} onChange={(event) => update('incomeRange', event.target.value)} />
        </div>
        <div className="field">
          <label>婚姻状态</label>
          <select value={form.maritalStatus} onChange={(event) => update('maritalStatus', event.target.value)}>
            {maritalOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>兴趣标签</label>
          <input value={form.interests} onChange={(event) => update('interests', event.target.value)} />
        </div>
        <div className="field full">
          <label>头像</label>
          <div className="media-upload">
            <img className="avatar large" src={form.avatarUrl} alt="" />
            <div className="grid">
              <input value={form.avatarUrl} onChange={(event) => update('avatarUrl', event.target.value)} />
              <input accept="image/*" type="file" onChange={(event) => uploadAvatar(event.target.files)} />
            </div>
          </div>
        </div>
        <div className="field full">
          <label>相册，最多 6 张</label>
          <input accept="image/*" multiple type="file" onChange={(event) => uploadAlbum(event.target.files)} />
          <input
            value={form.photos}
            onChange={(event) => update('photos', event.target.value)}
            placeholder="也可粘贴图片 URL，用逗号分隔"
          />
          <p className="subtle">新照片保存后会进入照片审核，通过后才会在推荐和资料页对外展示。</p>
          {photoList.length > 0 ? (
            <div className="photo-grid">
              {photoList.map((url) => (
                <div className="photo-tile" key={url}>
                  <img src={url} alt="" />
                  <button type="button" onClick={() => removePhoto(url)}>
                    移除
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="field full">
          <label>个人介绍</label>
          <textarea value={form.bio} onChange={(event) => update('bio', event.target.value)} />
        </div>
        <div className="field full">
          <label>理想对象</label>
          <textarea value={form.idealPartner} onChange={(event) => update('idealPartner', event.target.value)} />
        </div>
        <div className="field">
          <label>偏好最小年龄</label>
          <input
            max={80}
            min={18}
            type="number"
            value={form.minAge}
            onChange={(event) => update('minAge', Number(event.target.value))}
          />
        </div>
        <div className="field">
          <label>偏好最大年龄</label>
          <input
            max={80}
            min={18}
            type="number"
            value={form.maxAge}
            onChange={(event) => update('maxAge', Number(event.target.value))}
          />
        </div>
        <div className="field">
          <label>偏好城市</label>
          <input value={form.preferredCities} onChange={(event) => update('preferredCities', event.target.value)} />
        </div>
        <div className="field">
          <label>学历要求</label>
          <select value={form.educationRequirement} onChange={(event) => update('educationRequirement', event.target.value)}>
            {educationOptions.map((education) => (
              <option key={education}>{education}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>偏好最小身高</label>
          <input
            max={230}
            min={120}
            type="number"
            value={form.minHeightCm}
            onChange={(event) => update('minHeightCm', Number(event.target.value))}
          />
        </div>
        <div className="field">
          <label>偏好最大身高</label>
          <input
            max={230}
            min={120}
            type="number"
            value={form.maxHeightCm}
            onChange={(event) => update('maxHeightCm', Number(event.target.value))}
          />
        </div>
        <div className="field">
          <label>可接受婚姻状态</label>
          <input value={form.maritalStatuses} onChange={(event) => update('maritalStatuses', event.target.value)} />
        </div>
        <label className="check-row">
          <input
            checked={form.visibleInRecommend}
            type="checkbox"
            onChange={(event) => update('visibleInRecommend', event.target.checked)}
          />
          进入推荐池
        </label>
      </div>
      <div className="actions">
        <button className="button ghost" disabled={saving} type="button" onClick={save}>
          保存草稿
        </button>
        <button className="button" disabled={saving} type="button" onClick={submit}>
          提交审核
        </button>
      </div>
      {message ? <p className={message.includes('失败') ? 'error' : 'success'}>{message}</p> : null}
    </div>
  );
}
