import {badRequest, json, requireApiUser, unauthorized} from '@/lib/api';
import {toList} from '@/lib/json';
import {prisma} from '@/lib/prisma';

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

  if (!nickname || !birthYear || !city || !education || !occupation || !avatarUrl) {
    return badRequest('请填写昵称、出生年份、城市、学历、职业和头像');
  }

  if (bio.length < 20 || bio.length > 300) {
    return badRequest('个人介绍需要 20-300 字');
  }

  const profile = await prisma.profile.upsert({
    where: {userId: user.id},
    update: {
      nickname,
      gender,
      birthYear,
      city,
      heightCm: body.heightCm ? Number(body.heightCm) : null,
      education,
      occupation,
      incomeRange: String(body.incomeRange ?? '').trim() || null,
      maritalStatus: String(body.maritalStatus ?? '').trim() || null,
      hasChildren: Boolean(body.hasChildren),
      marriageTimeline: String(body.marriageTimeline ?? '').trim() || null,
      bio,
      idealPartner: String(body.idealPartner ?? '').trim() || null,
      avatarUrl,
      interests: toList(body.interests),
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
      heightCm: body.heightCm ? Number(body.heightCm) : null,
      education,
      occupation,
      incomeRange: String(body.incomeRange ?? '').trim() || null,
      maritalStatus: String(body.maritalStatus ?? '').trim() || null,
      hasChildren: Boolean(body.hasChildren),
      marriageTimeline: String(body.marriageTimeline ?? '').trim() || null,
      bio,
      idealPartner: String(body.idealPartner ?? '').trim() || null,
      avatarUrl,
      interests: toList(body.interests),
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

  return json({ok: true, profile, preferences});
}
