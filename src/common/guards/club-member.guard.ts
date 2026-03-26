import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { MemberRole, MemberStatus } from '@prisma/client';

export const CLUB_ID_KEY = 'clubId';

/**
 * 俱乐部成员守卫
 * 验证当前用户是否属于指定俱乐部
 */
@Injectable()
export class ClubMemberGuard implements CanActivate {
  private readonly logger = new Logger(ClubMemberGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // 从路由参数、查询参数或请求体中获取 clubId
    const clubId = 
      request.params?.clubId || 
      request.query?.clubId || 
      request.body?.clubId;

    if (!clubId) {
      throw new ForbiddenException('缺少俱乐部ID');
    }

    if (!user) {
      throw new ForbiddenException('请先登录');
    }

    // 查询用户是否属于该俱乐部
    const membership = await this.prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId: BigInt(clubId),
          userId: BigInt(user.sub),
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('您不属于该俱乐部');
    }

    if (membership.status !== MemberStatus.IDLE) {
      throw new ForbiddenException('您的成员状态异常');
    }

    // 将成员信息注入请求对象
    request.membership = membership;
    
    return true;
  }
}

/**
 * 俱乐部角色守卫
 * 验证当前用户在俱乐部中的角色
 */
@Injectable()
export class MemberRoleGuard implements CanActivate {
  private readonly logger = new Logger(MemberRoleGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<MemberRole[]>(
      'clubRoles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    const clubId = 
      request.params?.clubId || 
      request.query?.clubId || 
      request.body?.clubId;

    if (!clubId || !user) {
      throw new ForbiddenException('权限验证失败');
    }

    const membership = await this.prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId: BigInt(clubId),
          userId: BigInt(user.sub),
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('您不属于该俱乐部');
    }

    // 创始人拥有所有权限
    if (membership.role === MemberRole.OWNER) {
      request.membership = membership;
      return true;
    }

    // 检查角色是否符合要求
    if (!requiredRoles.includes(membership.role as MemberRole)) {
      throw new ForbiddenException('您没有该操作的权限');
    }

    request.membership = membership;
    return true;
  }
}