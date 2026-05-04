import Link from 'next/link';
import {AppShell} from '@/components/AppShell';
import {requireUser} from '@/lib/auth';
import {ageFromBirthYear, parseList} from '@/lib/json';

export default async function MePage() {
  const user = await requireUser();
  const profile = user.profile;

  return (
    <AppShell>
      <div className="panel grid">
        <h1>我的资料</h1>
        <p className="subtle">当前状态：{user.status}</p>
        {profile ? (
          <>
            <div className="profile-row">
              <img className="avatar" src={profile.avatarUrl} alt="" />
              <div>
                <h2>{profile.nickname}</h2>
                <p className="subtle">
                  {ageFromBirthYear(profile.birthYear)} 岁 · {profile.city} · {profile.education} · {profile.occupation}
                </p>
              </div>
            </div>
            <p>{profile.bio}</p>
            <div className="actions">
              {parseList(profile.interests).map((tag) => <span className="tag" key={tag}>{tag}</span>)}
            </div>
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
