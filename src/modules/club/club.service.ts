import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubDto, UpdateClubDto } from './dto/club.dto';

@Injectable()
export class ClubService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取用户的俱乐部列表
   */
  async getMyClubs(userId: bigint) {
    const memberships = await this.prisma.clubMember.findMany({
      where: { userId, status: 1 },
      include: {
        club: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...m.club,
      role: m.role,
      memberCount: m.club._count.members,
    }));
  }

  /**
   * 创建俱乐部
   */
  async create(userId: bigint, dto: CreateClubDto) {
    return this.prisma.$transaction(async (tx) => {
      // 创建俱乐部
      const club = await tx.club.create({
        data: {
          name: dto.name,
          logo: dto.logo,
          description: dto.description,
          ownerId: userId,
          status: 1,
        },
      });

      // 创建创始人成员关系
      await tx.clubMember.create({
        data: {
          clubId: club.id,
          userId,
          role: 1, // 创始人
          status: 1,
        },
      });

      // 创建默认配置
      await tx.clubConfig.create({
        data: {
          clubId: club.id,
          autoDeduct: false,
          minBalance: 0,
          approvalMode: 1,
          withdrawFeeRate: 0,
          minWithdrawAmount: 100,
          pointOrderOwnerRate: 30,
          pointOrderReceiverRate: 60,
          pointOrderClubRate: 10,
        },
      });

      return club;
    });
  }

  /**
   * 获取俱乐部详情
   */
  async getClubById(clubId: bigint) {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!club) {
      throw new NotFoundException('俱乐部不存在');
    }

    return club;
  }

  /**
   * 更新俱乐部信息
   */
  async update(clubId: bigint, dto: UpdateClubDto) {
    const club = await this.getClubById(clubId);

    return this.prisma.club.update({
      where: { id: clubId },
      data: dto,
    });
  }

  /**
   * 转让俱乐部
   */
  async transfer(clubId: bigint, currentOwnerId: bigint, newOwnerId: bigint) {
    const club = await this.getClubById(clubId);

    if (club.ownerId !== currentOwnerId) {
      throw new ForbiddenException('只有创始人可以转让俱乐部');
    }

    if (club.ownerId === newOwnerId) {
      throw new BadRequestException('不能转让给自己');
    }

    // 检查新所有者是否为成员
    const newOwnerMember = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: newOwnerId } },
    });

    if (!newOwnerMember) {
      throw new BadRequestException('新所有者必须是俱乐部成员');
    }

    return this.prisma.$transaction(async (tx) => {
      // 更新俱乐部所有者
      await tx.club.update({
        where: { id: clubId },
        data: { ownerId: newOwnerId },
      });

      // 将新所有者升级为创始人
      await tx.clubMember.update({
        where: { clubId_userId: { clubId, userId: newOwnerId } },
        data: { role: 1 },
      });

      // 将原创始人降级为管理员
      await tx.clubMember.update({
        where: { clubId_userId: { clubId, userId: currentOwnerId } },
        data: { role: 2 },
      });

      return { success: true, message: '俱乐部转让成功' };
    });
  }

  /**
   * 解散俱乐部
   */
  async dissolve(clubId: bigint, userId: bigint) {
    const club = await this.getClubById(clubId);

    if (club.ownerId !== userId) {
      throw new ForbiddenException('只有创始人可以解散俱乐部');
    }

    // 检查是否有待处理事项
    const pendingReports = await this.prisma.report.count({
      where: { clubId, status: 1 },
    });

    if (pendingReports > 0) {
      throw new BadRequestException('有待审批的报备，无法解散');
    }

    return this.prisma.$transaction(async (tx) => {
      // 删除所有成员关系
      await tx.clubMember.deleteMany({
        where: { clubId },
      });

      // 删除俱乐部配置
      await tx.clubConfig.deleteMany({
        where: { clubId },
      });

      // 删除俱乐部
      await tx.club.delete({
        where: { id: clubId },
      });

      return { success: true, message: '俱乐部已解散' };
    });
  }

  /**
   * 切换俱乐部
   */
  async switchClub(userId: bigint, clubId: bigint) {
    // 检查用户是否为该俱乐部成员
    const membership = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });

    if (!membership) {
      throw new ForbiddenException('您不是该俱乐部成员');
    }

    if (membership.status !== 1) {
      throw new ForbiddenException('俱乐部成员状态异常');
    }

    // 在实际应用中，这里应该更新用户的当前俱乐部缓存
    // 由于没有 user_club 关联表，我们返回俱乐部信息让前端存储

    const club = await this.getClubById(clubId);

    return {
      success: true,
      club: {
        ...club,
        role: membership.role,
      },
    };
  }
}
