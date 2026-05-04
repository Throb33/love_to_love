import {ageFromBirthYear, parseList} from './json';
import {prisma} from './prisma';

const educationRank: Record<string, number> = {
  高中: 1,
  大专: 2,
  本科: 3,
  硕士: 4,
  博士: 5,
};

export const normalizedPair = (left: string, right: string) =>
  [left, right].sort() as [string, string];

export const getRecommendations = async (userId: string) => {
  const me = await prisma.user.findUnique({
    where: {id: userId},
    include: {profile: true, preferences: true},
  });

  if (!me?.profile || !me.preferences || me.status !== 'APPROVED') {
    return [];
  }

  const skipped = await prisma.skip.findMany({
    where: {fromUserId: userId},
    select: {toUserId: true},
  });
  const liked = await prisma.like.findMany({
    where: {fromUserId: userId},
    select: {toUserId: true},
  });
  const matches = await prisma.match.findMany({
    where: {
      OR: [{userAId: userId}, {userBId: userId}],
    },
    select: {userAId: true, userBId: true},
  });

  const excluded = new Set([
    userId,
    ...skipped.map((item) => item.toUserId),
    ...liked.map((item) => item.toUserId),
    ...matches.map((item) => (item.userAId === userId ? item.userBId : item.userAId)),
  ]);

  const preferredCities = parseList(me.preferences.preferredCities);
  const preferredStatuses = parseList(me.preferences.maritalStatuses);
  const myAge = ageFromBirthYear(me.profile.birthYear);
  const myInterests = parseList(me.profile.interests);
  const targetGender = me.profile.gender === 'MALE' ? 'FEMALE' : 'MALE';

  const candidates = await prisma.user.findMany({
    where: {
      status: 'APPROVED',
      id: {notIn: Array.from(excluded)},
      profile: {gender: targetGender},
    },
    include: {
      profile: true,
      preferences: true,
      reportsAgainst: {where: {status: 'OPEN'}},
    },
  });

  return candidates
    .filter((candidate) => {
      if (!candidate.profile || !candidate.preferences) {
        return false;
      }

      const age = ageFromBirthYear(candidate.profile.birthYear);
      const candidateCities = parseList(candidate.preferences.preferredCities);
      const candidateStatuses = parseList(candidate.preferences.maritalStatuses);

      const matchesMine =
        age >= me.preferences!.minAge &&
        age <= me.preferences!.maxAge &&
        (preferredCities.length === 0 || preferredCities.includes(candidate.profile.city)) &&
        (!me.preferences!.minHeightCm ||
          !candidate.profile.heightCm ||
          candidate.profile.heightCm >= me.preferences!.minHeightCm) &&
        (!me.preferences!.maxHeightCm ||
          !candidate.profile.heightCm ||
          candidate.profile.heightCm <= me.preferences!.maxHeightCm) &&
        (!me.preferences!.educationRequirement ||
          (educationRank[candidate.profile.education] ?? 0) >=
            (educationRank[me.preferences!.educationRequirement] ?? 0)) &&
        (preferredStatuses.length === 0 ||
          !candidate.profile.maritalStatus ||
          preferredStatuses.includes(candidate.profile.maritalStatus));

      const matchesTheirs =
        myAge >= candidate.preferences.minAge &&
        myAge <= candidate.preferences.maxAge &&
        (candidateCities.length === 0 || candidateCities.includes(me.profile!.city)) &&
        (!candidate.preferences.minHeightCm ||
          !me.profile!.heightCm ||
          me.profile!.heightCm >= candidate.preferences.minHeightCm) &&
        (!candidate.preferences.maxHeightCm ||
          !me.profile!.heightCm ||
          me.profile!.heightCm <= candidate.preferences.maxHeightCm) &&
        (!candidate.preferences.educationRequirement ||
          (educationRank[me.profile!.education] ?? 0) >=
            (educationRank[candidate.preferences.educationRequirement] ?? 0)) &&
        (candidateStatuses.length === 0 ||
          !me.profile!.maritalStatus ||
          candidateStatuses.includes(me.profile!.maritalStatus));

      return matchesMine && matchesTheirs;
    })
    .map((candidate) => {
      const profile = candidate.profile!;
      const age = ageFromBirthYear(profile.birthYear);
      const interests = parseList(profile.interests);
      const overlap = interests.filter((item) => myInterests.includes(item)).length;
      const profileCompleteness = [
        profile.heightCm,
        profile.incomeRange,
        profile.maritalStatus,
        profile.idealPartner,
        profile.workRest,
      ].filter(Boolean).length;

      let score = 0;
      if (profile.city === me.profile!.city) score += 25;
      if (
        age >= me.preferences!.minAge + 2 &&
        age <= Math.max(me.preferences!.maxAge - 2, me.preferences!.minAge)
      ) {
        score += 15;
      }
      if (
        me.preferences!.educationRequirement &&
        (educationRank[profile.education] ?? 0) >=
          (educationRank[me.preferences!.educationRequirement] ?? 0)
      ) {
        score += 15;
      }
      score += Math.min(overlap * 5, 20);
      if (Date.now() - candidate.lastActiveAt.getTime() < 1000 * 60 * 60 * 24 * 14) {
        score += 10;
      }
      if (profileCompleteness >= 4) {
        score += 10;
      }
      score -= candidate.reportsAgainst.length * 8;

      return {
        id: candidate.id,
        score,
        age,
        profile: {
          nickname: profile.nickname,
          gender: profile.gender,
          city: profile.city,
          heightCm: profile.heightCm,
          education: profile.education,
          occupation: profile.occupation,
          avatarUrl: profile.avatarUrl,
          bio: profile.bio,
          idealPartner: profile.idealPartner,
          interests,
        },
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 20);
};
