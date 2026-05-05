import {badRequest, json, requireApiUser, unauthorized} from '@/lib/api';
import {toList} from '@/lib/json';
import {prisma} from '@/lib/prisma';

type NextProfileReviewFields = {
  nickname: string;
  gender: 'MALE' | 'FEMALE';
  birthYear: number;
  city: string;
  heightCm: number | null;
  education: string;
  occupation: string;
  bio: string;
  idealPartner: string | null;
  avatarUrl: string;
  photos: string;
  interests: string;
};

const changedDisplayProfile = (
  user: Awaited<ReturnType<typeof requireApiUser>>,
  next: NextProfileReviewFields,
) => {
  if (!user?.profile || user.status !== 'APPROVED') {
    return false;
  }

  const profile = user.profile;
  return (
    profile.nickname !== next.nickname ||
    profile.gender !== next.gender ||
    profile.birthYear !== next.birthYear ||
    profile.city !== next.city ||
    profile.heightCm !== next.heightCm ||
    profile.education !== next.education ||
    profile.occupation !== next.occupation ||
    profile.bio !== next.bio ||
    profile.idealPartner !== next.idealPartner ||
    profile.avatarUrl !== next.avatarUrl ||
    profile.photos !== next.photos ||
    profile.interests !== next.interests
  );
};

export async function GET() {
  const user = await requireApiUser();

  if (!user) {
    return unauthorized();
  }

  return json({user});
}

export async function PUT(request: Request) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorized();
  }

  const body = await request.json().catch(() => ({}));
  const nickname = String(body.nickname ?? '').trim();
  const birthYear = Number(body.birthYear);
  const city = String(body.city ?? '').trim();
  const education = String(body.education ?? '').trim();
  const occupation = String(body.occupation ?? '').trim();
  const bio = String(body.bio ?? '').trim();
  const avatarUrl = String(body.avatarUrl ?? '').trim();
  const gender = body.gender === 'FEMALE' ? 'FEMALE' : 'MALE';
  const heightCm = body.heightCm ? Number(body.heightCm) : null;
  const idealPartner = String(body.idealPartner ?? '').trim() || null;
  const photos = toList(body.photos);
  const interests = toList(body.interests);

  if (!nickname || !birthYear || !city || !education || !occupation || !avatarUrl) {
    return badRequest('请填写昵称、出生年份、城市、学历、职业和头像');
  }

  if (bio.length < 20 || bio.length > 300) {
    return badRequest('个人介绍需要 20-300 字');
  }

  const requiresReview = changedDisplayProfile(user, {
    nickname,
    gender,
    birthYear,
    city,
    heightCm,
    education,
    occupation,
    bio,
    idealPartner,
    avatarUrl,
    photos,
    interests,
  });

  const profile = await prisma.profile.upsert({
    where: {userId: user.id},
    update: {
      nickname,
      gender,
      birthYear,
      city,
      heightCm,
      education,
      occupation,
      incomeRange: String(body.incomeRange ?? '').trim() || null,
      maritalStatus: String(body.maritalStatus ?? '').trim() || null,
      hasChildren: Boolean(body.hasChildren),
      marriageTimeline: String(body.marriageTimeline ?? '').trim() || null,
      bio,
      idealPartner,
      avatarUrl,
      photos,
      interests,
      smokes: Boolean(body.smokes),
      drinks: Boolean(body.drinks),
      workRest: String(body.workRest ?? '').trim() || null,
    },
    create: {
      userId: user.id,
      nickname,
      gender,
      birthYear,
      city,
      heightCm,
      education,
      occupation,
      incomeRange: String(body.incomeRange ?? '').trim() || null,
      maritalStatus: String(body.maritalStatus ?? '').trim() || null,
      hasChildren: Boolean(body.hasChildren),
      marriageTimeline: String(body.marriageTimeline ?? '').trim() || null,
      bio,
      idealPartner,
      avatarUrl,
      photos,
      interests,
      smokes: Boolean(body.smokes),
      drinks: Boolean(body.drinks),
      workRest: String(body.workRest ?? '').trim() || null,
    },
  });

  const preferences = await prisma.partnerPreference.upsert({
    where: {userId: user.id},
    update: {
      minAge: Number(body.minAge ?? 24),
      maxAge: Number(body.maxAge ?? 40),
      preferredCities: toList(body.preferredCities),
      minHeightCm: body.minHeightCm ? Number(body.minHeightCm) : null,
      maxHeightCm: body.maxHeightCm ? Number(body.maxHeightCm) : null,
      educationRequirement: String(body.educationRequirement ?? '').trim() || null,
      maritalStatuses: toList(body.maritalStatuses),
    },
    create: {
      userId: user.id,
      minAge: Number(body.minAge ?? 24),
      maxAge: Number(body.maxAge ?? 40),
      preferredCities: toList(body.preferredCities),
      minHeightCm: body.minHeightCm ? Number(body.minHeightCm) : null,
      maxHeightCm: body.maxHeightCm ? Number(body.maxHeightCm) : null,
      educationRequirement: String(body.educationRequirement ?? '').trim() || null,
      maritalStatuses: toList(body.maritalStatuses),
    },
  });

  if (user.status === 'REJECTED') {
    await prisma.user.update({
      where: {id: user.id},
      data: {status: 'DRAFT'},
    });
  }

  if (requiresReview) {
    await prisma.user.update({
      where: {id: user.id},
      data: {status: 'PENDING_REVIEW'},
    });
  }

  return json({
    ok: true,
    profile,
    preferences,
    requiresReview,
    message: requiresReview ? '资料已保存，展示资料变更需要管理员重新审核' : '资料已保存',
  });
}
