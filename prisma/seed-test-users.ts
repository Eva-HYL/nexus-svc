/**
 * 测试账号种子数据
 * 创建 4 个不同角色的测试账号
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 测试账号配置
const TEST_USERS = [
  {
    phone: '13800000001',
    password: 'Test123456',
    nickname: '测试创始人',
    role: 'OWNER',
    clubName: '测试俱乐部 - 创始人',
  },
  {
    phone: '13800000002',
    password: 'Test123456',
    nickname: '测试管理员',
    role: 'ADMIN',
    clubName: '测试俱乐部 - 管理员',
  },
  {
    phone: '13800000003',
    password: 'Test123456',
    nickname: '测试组长',
    role: 'LEADER',
    clubName: '测试俱乐部 - 组长',
  },
  {
    phone: '13800000004',
    password: 'Test123456',
    nickname: '测试成员',
    role: 'MEMBER',
    clubName: '测试俱乐部 - 成员',
  },
];

async function main() {
  console.log('🌱 开始创建测试账号...');

  for (const userData of TEST_USERS) {
    console.log(`\n📱 创建账号：${userData.phone} (${userData.nickname})`);

    // 1. 创建或获取用户
    const user = await prisma.user.upsert({
      where: { phone: userData.phone },
      update: {
        nickname: userData.nickname,
      },
      create: {
        phone: userData.phone,
        password: userData.password,
        nickname: userData.nickname,
        status: 1,
      },
    });

    console.log(`   ✅ 用户创建成功：${user.id}`);

    // 2. 创建俱乐部
    const club = await prisma.club.upsert({
      where: { id: Number(user.id) },
      update: {
        name: userData.clubName,
        ownerId: user.id,
      },
      create: {
        id: Number(user.id),
        name: userData.clubName,
        ownerId: user.id,
        status: 1,
      },
    });

    console.log(`   ✅ 俱乐部创建成功：${club.name}`);

    // 3. 创建俱乐部成员关系
    const member = await prisma.clubMember.upsert({
      where: {
        clubId_userId: {
          clubId: club.id,
          userId: user.id,
        },
      },
      update: {
        role: userData.role as any,
        status: 'IDLE' as any,
      },
      create: {
        clubId: club.id,
        userId: user.id,
        role: userData.role as any,
        status: 'IDLE' as any,
        memberType: 'PART_TIME' as any,
      },
    });

    console.log(`   ✅ 成员关系创建成功：${userData.role}`);

    // 4. 创建钱包
    const wallet = await prisma.wallet.upsert({
      where: {
        clubId_userId: {
          clubId: club.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        clubId: club.id,
        userId: user.id,
        balance: 1000,
        points: 100,
        status: 1,
      },
    });

    console.log(`   ✅ 钱包创建成功：余额¥${wallet.balance}, 积分${wallet.points}`);

    // 5. 创建俱乐部配置
    await prisma.clubConfig.upsert({
      where: { clubId: club.id },
      update: {},
      create: {
        clubId: club.id,
        autoDeduct: false,
        approvalMode: 2,
        pointOrderOwnerRate: 30,
        pointOrderReceiverRate: 60,
        pointOrderClubRate: 10,
      },
    });

    console.log(`   ✅ 俱乐部配置创建成功`);
  }

  console.log('\n✅ 测试账号创建完成！\n');
  console.log('📋 测试账号列表:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('账号           密码          角色       俱乐部');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  TEST_USERS.forEach(user => {
    console.log(`${user.phone}  ${user.password}  ${user.role}  ${user.clubName}`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 提示：使用以上账号登录测试不同角色的权限');
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
