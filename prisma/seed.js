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
    avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
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
    avatarUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
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
    avatarUrl: 'https://randomuser.me/api/portraits/women/3.jpg',
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
    avatarUrl: 'https://randomuser.me/api/portraits/men/4.jpg',
  },
  {
    phone: '18600000005',
    nickname: '苏晚晴',
    gender: 'FEMALE',
    birthYear: 1996,
    city: '上海',
    heightCm: 168,
    education: '本科',
    occupation: '用户体验设计师',
    interests: ['插画', '瑜伽', '电影'],
    bio: '做事认真但不紧绷，喜欢有审美和生活气的人，期待彼此坦诚沟通。',
    avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    phone: '18600000006',
    nickname: '赵予安',
    gender: 'MALE',
    birthYear: 1989,
    city: '北京',
    heightCm: 180,
    education: '硕士',
    occupation: '产品总监',
    interests: ['网球', '阅读', '旅行'],
    bio: '工作稳定，周末会运动和看书，希望遇到独立温和、能一起成长的伴侣。',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    phone: '18600000007',
    nickname: '梁知意',
    gender: 'FEMALE',
    birthYear: 1994,
    city: '深圳',
    heightCm: 165,
    education: '硕士',
    occupation: '数据分析师',
    interests: ['阅读', '羽毛球', '烘焙'],
    bio: '理性但有温度，喜欢简单稳定的生活，希望双方都能尊重彼此的节奏。',
    avatarUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    phone: '18600000008',
    nickname: '吴景行',
    gender: 'MALE',
    birthYear: 1991,
    city: '杭州',
    heightCm: 176,
    education: '本科',
    occupation: '运营经理',
    interests: ['骑行', '音乐', '咖啡'],
    bio: '性格开朗，喜欢计划旅行和探索城市小店，期待真诚直接的关系。',
    avatarUrl: 'https://randomuser.me/api/portraits/men/76.jpg',
  },
  {
    phone: '18600000009',
    nickname: '顾念',
    gender: 'FEMALE',
    birthYear: 1997,
    city: '南京',
    heightCm: 162,
    education: '本科',
    occupation: '小学教师',
    interests: ['手作', '音乐剧', '散步'],
    bio: '喜欢温柔坚定的人，重视家庭感，也希望彼此有自己的兴趣和空间。',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    phone: '18600000010',
    nickname: '沈以辰',
    gender: 'MALE',
    birthYear: 1993,
    city: '苏州',
    heightCm: 177,
    education: '本科',
    occupation: '机械工程师',
    interests: ['游泳', '纪录片', '做饭'],
    bio: '踏实慢热，喜欢把生活打理得有秩序，希望遇到愿意一起过日子的人。',
    avatarUrl: 'https://randomuser.me/api/portraits/men/54.jpg',
  },
  {
    phone: '18600000011',
    nickname: '唐若溪',
    gender: 'FEMALE',
    birthYear: 1992,
    city: '成都',
    heightCm: 166,
    education: '硕士',
    occupation: '心理咨询师',
    interests: ['阅读', '茶', '徒步'],
    bio: '重视情绪稳定和长期沟通，喜欢舒服自然的相处，不急但认真。',
    avatarUrl: 'https://randomuser.me/api/portraits/women/33.jpg',
  },
  {
    phone: '18600000012',
    nickname: '陆时越',
    gender: 'MALE',
    birthYear: 1988,
    city: '广州',
    heightCm: 182,
    education: '硕士',
    occupation: '律师',
    interests: ['健身', '古典音乐', '旅行'],
    bio: '职业节奏较忙，但会认真投入关系，希望彼此成熟、稳定、愿意沟通。',
    avatarUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
  },
  {
    phone: '18600000013',
    nickname: '姜南星',
    gender: 'FEMALE',
    birthYear: 1995,
    city: '武汉',
    heightCm: 164,
    education: '本科',
    occupation: '品牌策划',
    interests: ['展览', '摄影', '跑步'],
    bio: '喜欢有趣但靠谱的人，期待一起体验生活，也能认真讨论未来。',
    avatarUrl: 'https://randomuser.me/api/portraits/women/79.jpg',
  },
  {
    phone: '18600000014',
    nickname: '程知远',
    gender: 'MALE',
    birthYear: 1994,
    city: '深圳',
    heightCm: 175,
    education: '本科',
    occupation: '前端工程师',
    interests: ['篮球', '电影', '露营'],
    bio: '喜欢技术也喜欢户外，性格直接，期待轻松真诚、能一起探索世界的关系。',
    avatarUrl: 'https://randomuser.me/api/portraits/men/41.jpg',
  },
];

async function main() {
  await prisma.user.upsert({
    where: {phone: '19999999999'},
    update: {role: 'ADMIN', status: 'APPROVED'},
    create: {phone: '19999999999', role: 'ADMIN', status: 'APPROVED'},
  });

  for (const item of samples) {
    const isNewDemoUser = Number(item.phone.slice(-2)) >= 5;
    const user = await prisma.user.upsert({
      where: {phone: item.phone},
      update: {status: 'APPROVED'},
      create: {phone: item.phone, status: 'APPROVED'},
    });

    const profileData = {
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
      avatarUrl: item.avatarUrl,
      interests: JSON.stringify(item.interests),
      bio: item.bio,
      idealPartner: '真诚、稳定、愿意沟通。',
    };

    const preferenceData = {
      minAge: 24,
      maxAge: 40,
      preferredCities: JSON.stringify(['上海', '北京', '深圳', '广州', '杭州', '南京', '苏州', '成都', '武汉']),
      minHeightCm: item.gender === 'FEMALE' ? 172 : 155,
      maxHeightCm: item.gender === 'FEMALE' ? 190 : 185,
      educationRequirement: '本科',
      maritalStatuses: JSON.stringify(['未婚']),
    };

    await prisma.profile.upsert({
      where: {userId: user.id},
      update: isNewDemoUser ? profileData : {},
      create: {userId: user.id, ...profileData},
    });

    await prisma.partnerPreference.upsert({
      where: {userId: user.id},
      update: isNewDemoUser ? preferenceData : {},
      create: {userId: user.id, ...preferenceData},
    });

    await prisma.userSetting.upsert({
      where: {userId: user.id},
      update: {visibleInRecommend: true},
      create: {userId: user.id, visibleInRecommend: true},
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
