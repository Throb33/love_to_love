const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient();

const samples = [
  {
    phone: '18600000001',
    nickname: '林夏',
    gender: 'FEMALE',
    birthYear: 1995,
    city: '上海',
    heightCm: 166,
    education: '本科',
    occupation: '产品经理',
    interests: ['咖啡', '徒步', '电影'],
    bio: '喜欢稳定真诚的关系，工作日专注工作，周末喜欢探索城市里的咖啡馆和展览。',
  },
  {
    phone: '18600000002',
    nickname: '许然',
    gender: 'MALE',
    birthYear: 1992,
    city: '上海',
    heightCm: 178,
    education: '硕士',
    occupation: '后端工程师',
    interests: ['电影', '跑步', '做饭'],
    bio: '性格温和，认真生活，希望遇到愿意一起规划未来的人。',
  },
  {
    phone: '18600000003',
    nickname: '陈一诺',
    gender: 'FEMALE',
    birthYear: 1993,
    city: '杭州',
    heightCm: 164,
    education: '硕士',
    occupation: '金融分析师',
    interests: ['阅读', '旅行', '跑步'],
    bio: '重视沟通和边界感，期待成熟可靠、愿意长期经营关系的伴侣。',
  },
  {
    phone: '18600000004',
    nickname: '周予安',
    gender: 'MALE',
    birthYear: 1990,
    city: '上海',
    heightCm: 181,
    education: '本科',
    occupation: '建筑设计师',
    interests: ['摄影', '咖啡', '旅行'],
    bio: '喜欢设计和影像，生活节奏规律，希望找到可以认真相处的人。',
  },
];

async function main() {
  await prisma.user.upsert({
    where: {phone: '19999999999'},
    update: {role: 'ADMIN', status: 'APPROVED'},
    create: {phone: '19999999999', role: 'ADMIN', status: 'APPROVED'},
  });

  for (const item of samples) {
    const user = await prisma.user.upsert({
      where: {phone: item.phone},
      update: {status: 'APPROVED'},
      create: {phone: item.phone, status: 'APPROVED'},
    });

    await prisma.profile.upsert({
      where: {userId: user.id},
      update: {},
      create: {
        userId: user.id,
        nickname: item.nickname,
        gender: item.gender,
        birthYear: item.birthYear,
        city: item.city,
        heightCm: item.heightCm,
        education: item.education,
        occupation: item.occupation,
        incomeRange: '30-50万',
        maritalStatus: '未婚',
        marriageTimeline: '1-2年内',
        avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(item.nickname)}`,
        interests: JSON.stringify(item.interests),
        bio: item.bio,
        idealPartner: '真诚、稳定、愿意沟通。',
      },
    });

    await prisma.partnerPreference.upsert({
      where: {userId: user.id},
      update: {},
      create: {
        userId: user.id,
        minAge: 26,
        maxAge: 38,
        preferredCities: JSON.stringify(['上海', '杭州']),
        minHeightCm: item.gender === 'FEMALE' ? 172 : 155,
        educationRequirement: '本科',
        maritalStatuses: JSON.stringify(['未婚']),
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
