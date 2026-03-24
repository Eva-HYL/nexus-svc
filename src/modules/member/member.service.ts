import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClubRole, MemberStatus } from '../../common/constants';

@Injectable()
export class MemberService {
  private readonly logger = new Logger(MemberService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 获取成员列表
   */
  async findAll(clubId: bigint, query: { page?: number; pageSize?: number; status?: number; role?: number }) {
    const { page = 1, pageSize = 20, status, role } = query;
    
    const where: any = { clubId };
    if (status) where.status = status;
    if (role) where.role = role;

    const [list, total] = await Promise.all([
      this.prisma.clubMember.findMany({
        where,
        include: { 
          user: { 
            select: { id: true, nickname: true, avatar: true, phone: true } 
          } 
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { joinedAt: 'desc' },
      }),
      this.prisma.clubMember.count({ where }),
    ]);
    
    return { list, pagination: { page, pageSize, total } };
  }

  /**
   * 获取待审核成员列表
   */
  async findPending(clubId: bigint) {
    return this.prisma.clubMember.findMany({
      where: { clubId, status: MemberStatus.PENDING },
      include: { 
        user: { 
          select: { id: true, nickname: true, avatar: true, phone: true, createdAt: true } 
        } 
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * 申请加入俱乐部
   */
  async apply(clubId: bigint, userId: bigint) {
    // 检查俱乐部是否存在
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('俱乐部不存在');

    // 检查是否已申请或已加入
    const existing = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });

    if (existing) {
      if (existing.status === MemberStatus.ACTIVE) {
        throw new BadRequestException('您已是该俱乐部的成员');
      }
      if (existing.status === MemberStatus.PENDING) {
        throw new BadRequestException('您已提交过申请，请等待审核');
      }
    }

    // 创建申请（待审核状态）
    const member = await this.prisma.clubMember.upsert({
      where: { clubId_userId: { clubId, userId } },
      create: { 
        clubId, 
        userId, 
        role: ClubRole.MEMBER, 
        status: MemberStatus.PENDING 
      },
      update: { status: MemberStatus.PENDING },
    });

    this.logger.log(`成员申请加入: user ${userId} -> club ${clubId}`);
    return member;
  }

  /**
   * 审批通过成员申请
   */
  async approve(clubId: bigint, userId: bigint, approverId: bigint, role: ClubRole = ClubRole.MEMBER) {
    const membership = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });

    if (!membership) throw new NotFoundException('申请记录不存在');
    if (membership.status !== MemberStatus.PENDING) {
      throw new BadRequestException('该申请已处理');
    }

    const result = await this.prisma.clubMember.update({
      where: { clubId_userId: { clubId, userId } },
      data: { 
        status: MemberStatus.ACTIVE, 
        role,
        joinedAt: new Date(),
      },
    });

    this.logger.log(`成员审批通过: user ${userId} approved by ${approverId}`);
    return result;
  }

  /**
   * 拒绝成员申请
   */
  async reject(clubId: bigint, userId: bigint, approverId: bigint, reason?: string) {
    const membership = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });

    if (!membership) throw new NotFoundException('申请记录不存在');
    if (membership.status !== MemberStatus.PENDING) {
      throw new BadRequestException('该申请已处理');
    }

    const result = await this.prisma.clubMember.update({
      where: { clubId_userId: { clubId, userId } },
      data: { status: MemberStatus.REJECTED },
    });

    this.logger.log(`成员申请拒绝: user ${userId} rejected by ${approverId}, reason: ${reason || 'N/A'}`);
    return result;
  }

  /**
   * 批量审批通过
   */
  async batchApprove(clubId: bigint, userIds: bigint[], approverId: bigint) {
    const result = await this.prisma.clubMember.updateMany({
      where: {
        clubId,
        userId: { in: userIds },
        status: MemberStatus.PENDING,
      },
      data: { 
        status: MemberStatus.ACTIVE,
        joinedAt: new Date(),
      },
    });

    this.logger.log(`批量审批通过: ${result.count} members approved by ${approverId}`);
    return { success: true, count: result.count };
  }

  /**
   * 更新成员角色
   */
  async updateRole(clubId: bigint, userId: bigint, newRole: number, operatorId: bigint) {
    const member = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });
    
    if (!member) throw new NotFoundException('成员不存在');

    // 不能修改创始人的角色
    if (member.role === ClubRole.FOUNDER) {
      throw new ForbiddenException('不能修改创始人的角色');
    }

    // 检查操作者权限（只有创始人可以设置管理员）
    const operator = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: operatorId } },
    });

    if (newRole === ClubRole.ADMIN && operator?.role !== ClubRole.FOUNDER) {
      throw new ForbiddenException('只有创始人可以设置管理员');
    }

    return this.prisma.clubMember.update({
      where: { clubId_userId: { clubId, userId } },
      data: { role: newRole },
    });
  }

  /**
   * 移除成员（软删除）
   */
  async remove(clubId: bigint, userId: bigint, operatorId: bigint) {
    const member = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });
    
    if (!member) throw new NotFoundException('成员不存在');

    // 不能移除创始人
    if (member.role === ClubRole.FOUNDER) {
      throw new ForbiddenException('不能移除创始人');
    }

    const result = await this.prisma.clubMember.update({
      where: { clubId_userId: { clubId, userId } },
      data: { status: MemberStatus.QUIT },
    });

    this.logger.log(`成员移除: user ${userId} removed by ${operatorId}`);
    return result;
  }

  /**
   * 直接添加成员（管理员操作，无需审批）
   */
  async addDirectly(clubId: bigint, userId: bigint, role: ClubRole = ClubRole.MEMBER, operatorId: bigint) {
    // 检查是否已存在
    const existing = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });

    if (existing && existing.status === MemberStatus.ACTIVE) {
      throw new BadRequestException('该用户已是俱乐部成员');
    }

    return this.prisma.clubMember.upsert({
      where: { clubId_userId: { clubId, userId } },
      create: { clubId, userId, role, status: MemberStatus.ACTIVE },
      update: { status: MemberStatus.ACTIVE, role },
    });
  }

  /**
   * 生成邀请码/链接
   * TODO: 实现邀请码生成和验证逻辑
   */
  async generateInviteCode(clubId: bigint, operatorId: bigint): Promise<string> {
    // 验证操作者权限
    const operator = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: operatorId } },
    });

    if (!operator || operator.status !== MemberStatus.ACTIVE) {
      throw new ForbiddenException('无权限生成邀请码');
    }

    // 生成简单邀请码（实际生产环境应该更复杂）
    const crypto = await import('crypto');
    const code = crypto.randomBytes(6).toString('base64url').toUpperCase();
    
    // TODO: 将邀请码存入数据库，设置过期时间
    
    this.logger.log(`邀请码生成: club ${clubId}, code ${code}`);
    return code;
  }
}