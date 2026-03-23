import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
// 角色: 1创始人 2管理员 3成员
export const Roles = (...roles: number[]) => SetMetadata(ROLES_KEY, roles);
