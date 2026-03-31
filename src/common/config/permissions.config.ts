import { MemberRole } from '@prisma/client';

/**
 * 权限矩阵配置
 * 
 * 角色等级：OWNER(1) > ADMIN(2) > LEADER(3) > MEMBER(4)
 * 数字越小权限越高
 */

export interface PermissionModule {
  name: string;
  description: string;
  minRole: MemberRole; // 最低角色要求（数字越小权限越高）
}

/**
 * 权限模块定义
 */
export const PERMISSION_MODULES: Record<string, PermissionModule> = {
  // 俱乐部管理
  CLUB_MANAGE: {
    name: '俱乐部管理',
    description: '管理俱乐部信息、转让、解散',
    minRole: MemberRole.OWNER,
  },
  
  // 成员管理
  MEMBER_MANAGE: {
    name: '成员管理',
    description: '添加、删除、修改成员信息',
    minRole: MemberRole.LEADER,
  },
  
  // 公告管理
  NOTICE_MANAGE: {
    name: '公告管理',
    description: '发布、编辑、删除公告',
    minRole: MemberRole.ADMIN,
  },
  
  // 罚款管理
  FINE_MANAGE: {
    name: '罚款管理',
    description: '开具罚款、豁免罚款',
    minRole: MemberRole.LEADER,
  },
  
  // 团费管理
  GROUP_FEE_MANAGE: {
    name: '团费管理',
    description: '设置团费、查看缴费记录',
    minRole: MemberRole.LEADER,
  },
  
  // 存单管理
  DEPOSIT_MANAGE: {
    name: '存单管理',
    description: '创建存单、审批退还',
    minRole: MemberRole.LEADER,
  },
  
  // 报备审批
  REPORT_APPROVE: {
    name: '报备审批',
    description: '审批报备记录',
    minRole: MemberRole.LEADER,
  },
  
  // 报备提交
  REPORT_SUBMIT: {
    name: '报备提交',
    description: '提交报备记录',
    minRole: MemberRole.MEMBER,
  },
  
  // 个人中心
  PROFILE_VIEW: {
    name: '个人中心',
    description: '查看个人信息、收益',
    minRole: MemberRole.MEMBER,
  },
};

/**
 * 角色权限映射表
 */
export const ROLE_PERMISSIONS: Record<MemberRole, string[]> = {
  [MemberRole.OWNER]: Object.keys(PERMISSION_MODULES), // 全部权限
  
  [MemberRole.ADMIN]: [
    'NOTICE_MANAGE',      // 公告管理
    'REPORT_APPROVE',     // 报备审批
    'REPORT_SUBMIT',      // 报备提交
    'PROFILE_VIEW',       // 个人中心
    'MEMBER_MANAGE',      // 成员管理
    'FINE_MANAGE',        // 罚款管理
    'GROUP_FEE_MANAGE',   // 团费管理
    'DEPOSIT_MANAGE',     // 存单管理
  ],
  
  [MemberRole.LEADER]: [
    'MEMBER_MANAGE',      // 成员管理
    'FINE_MANAGE',        // 罚款管理
    'GROUP_FEE_MANAGE',   // 团费管理
    'DEPOSIT_MANAGE',     // 存单管理
    'REPORT_APPROVE',     // 报备审批
    'REPORT_SUBMIT',      // 报备提交
    'PROFILE_VIEW',       // 个人中心
  ],
  
  [MemberRole.MEMBER]: [
    'REPORT_SUBMIT',      // 报备提交
    'PROFILE_VIEW',       // 个人中心
  ],
};

/**
 * 角色等级映射
 */
export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  [MemberRole.OWNER]: 1,
  [MemberRole.ADMIN]: 2,
  [MemberRole.LEADER]: 3,
  [MemberRole.MEMBER]: 4,
};

/**
 * 角色显示名称
 */
export const ROLE_DISPLAY_NAMES: Record<MemberRole, string> = {
  [MemberRole.OWNER]: '创始人',
  [MemberRole.ADMIN]: '管理员',
  [MemberRole.LEADER]: '组长',
  [MemberRole.MEMBER]: '成员',
};

/**
 * 角色标识颜色
 */
export const ROLE_COLORS: Record<MemberRole, string> = {
  [MemberRole.OWNER]: '#EAB308',    // 金色
  [MemberRole.ADMIN]: '#3B82F6',    // 蓝色
  [MemberRole.LEADER]: '#10B981',   // 绿色
  [MemberRole.MEMBER]: '#6B7280',   // 灰色
};

/**
 * 检查用户是否有指定权限
 */
export function hasPermission(userRole: MemberRole, permission: string): boolean {
  const userPermissions = ROLE_PERMISSIONS[userRole];
  return userPermissions.includes(permission);
}

/**
 * 检查用户是否可以操作目标角色
 * (高等级可以操作低等级)
 */
export function canOperateRole(userRole: MemberRole, targetRole: MemberRole): boolean {
  const userLevel = ROLE_HIERARCHY[userRole];
  const targetLevel = ROLE_HIERARCHY[targetRole];
  return userLevel <= targetLevel;
}
