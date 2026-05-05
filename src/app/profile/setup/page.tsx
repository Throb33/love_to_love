import {AppShell} from '@/components/AppShell';
import {ProfileForm} from '@/components/ProfileForm';
import {requireUser} from '@/lib/auth';
import {parseList} from '@/lib/json';

export default async function ProfileSetupPage() {
  const user = await requireUser();
  const initial = user.profile
    ? {
        nickname: user.profile.nickname,
        gender: user.profile.gender,
        birthYear: user.profile.birthYear,
        city: user.profile.city,
        heightCm: user.profile.heightCm ?? 178,
        education: user.profile.education,
        occupation: user.profile.occupation,
        incomeRange: user.profile.incomeRange ?? '',
        maritalStatus: user.profile.maritalStatus ?? '未婚',
        bio: user.profile.bio,
        idealPartner: user.profile.idealPartner ?? '',
        avatarUrl: user.profile.avatarUrl,
        photos:
          user.profilePhotos.length > 0
            ? user.profilePhotos.map((photo) => photo.url).join(',')
            : parseList(user.profile.photos).join(','),
        interests: parseList(user.profile.interests).join(','),
        minAge: user.preferences?.minAge ?? 24,
        maxAge: user.preferences?.maxAge ?? 38,
        preferredCities: parseList(user.preferences?.preferredCities).join(','),
        minHeightCm: user.preferences?.minHeightCm ?? 155,
        maxHeightCm: user.preferences?.maxHeightCm ?? 190,
        educationRequirement: user.preferences?.educationRequirement ?? '本科',
        maritalStatuses: parseList(user.preferences?.maritalStatuses).join(','),
        visibleInRecommend: user.settings?.visibleInRecommend ?? true,
      }
    : undefined;

  return (
    <AppShell>
      <h1>完善相亲资料</h1>
      <p className="subtle">资料保存后可以提交审核，审核通过后才会进入推荐池。</p>
      <ProfileForm initial={initial} />
    </AppShell>
  );
}
