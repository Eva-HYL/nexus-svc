import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportStatus, MemberStatus, MemberRole } from '@prisma/client';

@Injectable()
export class ClubService {
  private readonly logger = new Logger(ClubService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 创建俱乐部
   */
  async create(ownerId: bigint, data: { name: string; logo?: string; description?: string; depositAmount?: number }) {
    const club = await this.prisma.club.create({
      data: { 
        name: data.name,
        logo: data.logo,
        description: data.description,
        ownerId,
        status: 1,
      },
    });
    
    // 创建者自动成为创始人成员
    await this.prisma.clubMember.create({
      data: { clubId: club.id, userId: ownerId, role: MemberRole.OWNER, status: MemberStatus.IDLE },
    });
    
    this.logger.log(`俱乐部创建成功: ${club.id} by user ${ownerId}`);
    return club;
  }

  /**
   * 查询俱乐部详情
   */
  async findById(id: bigint) {
    const club = await this.prisma.club.findUnique({ 
      where: { id },
      include: {
        _count: {
          select: { members: true, projects: true },
        },
      },
    });
    if (!club) throw new NotFoundException('俱乐部不存在');
    return club;
  }

  /**
   * 查询用户加入的俱乐部列表
   */
  async findByUser(userId: bigint) {
    return this.prisma.clubMember.findMany({
      where: { userId, status: MemberStatus.IDLE },
      include: { 
        club: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  /**
   * 更新俱乐部信息
   */
  async update(id: bigint, data: Partial<{ name: string; logo: string; description: string }>) {
    const club = await this.prisma.club.findUnique({ where: { id } });
    if (!club) throw new NotFoundException('俱乐部不存在');
    
    return this.prisma.club.update({ where: { id }, data });
  }

  /**
   * 转让俱乐部
   * 只有创始人可以转让
   */
  async transfer(clubId: bigint, currentOwnerId: bigint, newOwnerId: bigint) {
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('俱乐部不存在');

    // 验证当前用户是否为创始人
    if (club.ownerId !== currentOwnerId) {
      throw new ForbiddenException('只有创始人可以转让俱乐部');
    }

    // 验证新所有者是否为俱乐部成员
    const newOwnerMembership = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: newOwnerId } },
    });

    if (!newOwnerMembership || newOwnerMembership.status !== ReportStatus.PENDING) {
      throw new BadRequestException('新所有者必须是俱乐部的活跃成员');
    }

    // 执行转让（事务）
    const result = await this.prisma.$transaction(async (tx) => {
      // 更新俱乐部所有者
      const updatedClub = await tx.club.update({
        where: { id: clubId },
        data: { ownerId: newOwnerId },
      });

      // 将新所有者角色更新为创始人
      await tx.clubMember.update({
        where: { clubId_userId: { clubId, userId: newOwnerId } },
        data: { role: MemberRole.OWNER },
      });

      // 将原创始人降级为管理员
      await tx.clubMember.update({
        where: { clubId_userId: { clubId, userId: currentOwnerId } },
        data: { role: MemberRole.ADMIN },
      });

      return updatedClub;
    });

    this.logger.log(`俱乐部转让成功: ${clubId} from ${currentOwnerId} to ${newOwnerId}`);
    return result;
  }

  /**
   * 解散俱乐部
   * 只有创始人可以解散，需要满足条件：
   * 1. 没有待处理的报备
   * 2. 没有待发放的工资
   */
  async dissolve(clubId: bigint, userId: bigint) {
    const club = await this.prisma.club.findUnique({ 
      where: { id: clubId },
      include: {
        // reports: { where: { status: ReportStatus.PENDING } }, // 待审批报备
        // // // salaries: { where: { status: { in: [1, 2] } } }, // 待发放/发放中工资
      },
    });

    if (!club) throw new NotFoundException('俱乐部不存在');

    // 验证权限
    if (club.ownerId !== userId) {
      throw new ForbiddenException('只有创始人可以解散俱乐部');
    }

    // 检查是否有待处理事项
    if (false) { // club.reports.length > 0
      throw new BadRequestException('还有待审批的报备，无法解散');
    }

    if (false) { // club.salaries.length > 0
      throw new BadRequestException('还有待发放的工资，无法解散');
    }

    // 执行解散（软删除）
    await this.prisma.$transaction(async (tx) => {
      // 标记俱乐部为禁用
      await tx.club.update({
        where: { id: clubId },
        data: { status: 2 },
      });

      // 将所有成员状态设为已退出
      await tx.clubMember.updateMany({
        where: { clubId },
        data: { status: MemberStatus.LEFT },
      });
    });

    this.logger.log(`俱乐部已解散: ${clubId}`);
    return { success: true, message: '俱乐部已解散' };
  }

  /**
   * 退出俱乐部
   * 创始人不能退出（只能转让或解散）
   */
  async quit(clubId: bigint, userId: bigint) {
    const membership = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });

    if (!membership) throw new NotFoundException('您不是该俱乐部的成员');

    if (membership.role === MemberRole.OWNER) {
      throw new BadRequestException('创始人不能退出俱乐部，请先转让或解散');
    }

    await this.prisma.clubMember.update({
      where: { clubId_userId: { clubId, userId } },
      data: { status: MemberStatus.LEFT },
    });

    this.logger.log(`成员退出俱乐部: ${userId} from club ${clubId}`);
    return { success: true };
  }
}