import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MemberRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<MemberRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('用户未登录');
    }

    const userRole = user.role as MemberRole;
    const hasRole = requiredRoles.some((role) => {
      // 角色等级：OWNER(1) > ADMIN(2) > LEADER(3) > MEMBER(4)
      const roleHierarchy: Record<MemberRole, number> = {
        [MemberRole.OWNER]: 1,
        [MemberRole.ADMIN]: 2,
        [MemberRole.LEADER]: 3,
        [MemberRole.MEMBER]: 4,
      };

      const requiredLevel = roleHierarchy[role];
      const userLevel = roleHierarchy[userRole];

      // 用户等级 <= 要求等级 即有权限
      return userLevel <= requiredLevel;
    });

    if (!hasRole) {
      throw new ForbiddenException('权限不足');
    }

    return true;
  }
}
