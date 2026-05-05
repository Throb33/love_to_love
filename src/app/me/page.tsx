import Link from 'next/link';
import {AppShell} from '@/components/AppShell';
import {requireUser} from '@/lib/auth';
import {ageFromBirthYear, parseList} from '@/lib/json';

const statusMessage = (status: string) => {
  if (status === 'PENDING_REVIEW') {
    return {
      title: '资料审核中',
      body: '展示资料已提交给管理员审核，审核通过后会重新进入推荐池。',
      tone: 'warning',
    };
  }

  if (status === 'REJECTED') {
    return {
      title: '资料审核未通过',
      body: '请根据驳回原因修改资料后重新提交审核。',
      tone: 'danger',
    };
  }

  if (status === 'BANNED') {
    return {
      title: '账号已禁用',
      body: '该账号暂时无法使用推荐、匹配和聊天功能。',
      tone: 'danger',
    };
  }

  if (status === 'DRAFT') {
    return {
      title: '资料未提交',
      body: '请完善资料并提交审核。',
      tone: 'warning',
    };
  }

  return null;
};

export default async function MePage() {
  const user = await requireUser();
  const profile = user.profile;
  const photos =
    user.profilePhotos.length > 0
      ? user.profilePhotos
          .filter((photo) => photo.status === 'APPROVED')
          .map((photo) => photo.url)
      : profile
        ? parseList(profile.photos)
        : [];
  const notice = statusMessage(user.status);

  return (
    <AppShell>
      <div className="panel grid">
        <h1>我的资料</h1>
        {notice ? (
          <div className={`state-callout ${notice.tone}`}>
            <strong>{notice.title}</strong>
            <p>{notice.body}</p>
          </div>
        ) : null}
        {profile ? (
          <>
            <div className="profile-row">
              <img className="avatar" src={profile.avatarUrl} alt="" />
              <div>
                <h2>{profile.nickname}</h2>
                <p className="subtle">
                  {ageFromBirthYear(profile.birthYear)} 岁 · {profile.city} ·{' '}
                  {profile.education} · {profile.occupation}
                </p>
              </div>
            </div>
            <p>{profile.bio}</p>
            <div className="actions">
              {parseList(profile.interests).map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            {photos.length > 0 ? (
              <div className="photo-grid">
                {photos.map((url) => (
                  <img src={url} alt="" key={url} />
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <p className="subtle">尚未填写资料。</p>
        )}
        <Link className="button" href="/profile/setup">
          编辑资料
        </Link>
      </div>
    </AppShell>
  );
}
