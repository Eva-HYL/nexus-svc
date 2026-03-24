import { SetMetadata } from '@nestjs/common';
import { ClubRole } from '../constants';

export const CLUB_ROLES_KEY = 'clubRoles';

/**
 * 俱乐部角色装饰器
 * 用于标注接口所需的俱乐部角色
 * 
 * @example
 * @ClubRoles(ClubRole.ADMIN, ClubRole.FOUNDER)
 * @UseGuards(ClubRoleGuard)
 * approveReport() {}
 */
export const ClubRoles = (...roles: ClubRole[]) => SetMetadata(CLUB_ROLES_KEY, roles);

/**
 * 装饰器组合：需要指定俱乐部角色
 * 包含 ClubMemberGuard 和 ClubRoleGuard
 */
import { applyDecorators, UseGuards } from '@nestjs/common';
import { ClubMemberGuard, ClubRoleGuard } from '../guards/club-member.guard';

export function RequireClubRole(...roles: ClubRole[]) {
  return applyDecorators(
    ClubRoles(...roles),
    UseGuards(ClubMemberGuard, ClubRoleGuard),
  );
}