/**
 * Elva 系统枚举定义
 * 统一管理所有状态码、角色、类型等枚举值
 */

// ==================== 用户状态 ====================
export enum UserStatus {
  /** 正常 */
  ACTIVE = 1,
  /** 禁用 */
  DISABLED = 2,
}

// ==================== 俱乐部状态 ====================
export enum ClubStatus {
  /** 正常 */
  ACTIVE = 1,
  /** 禁用 */
  DISABLED = 2,
}

// ==================== 成员角色 ====================
export enum ClubRole {
  /** 创始人 - 最高权限 */
  FOUNDER = 1,
  /** 管理员 - 管理权限 */
  ADMIN = 2,
  /** 所属人/组长 - 组内管理 */
  LEADER = 3,
  /** 普通成员 - 接单人 */
  MEMBER = 4,
}

// ==================== 成员状态 ====================
export enum MemberStatus {
  /** 正常 */
  ACTIVE = 1,
  /** 待审核 */
  PENDING = 2,
  /** 已退出 */
  QUIT = 3,
  /** 已拒绝 */
  REJECTED = 4,
}

// ==================== 项目类型 ====================
export enum ProjectType {
  /** 游戏 */
  GAME = 1,
  /** 礼物 */
  GIFT = 2,
}

// ==================== 价格类型 ====================
export enum PriceType {
  /** 按时长计费 */
  DURATION = 1,
  /** 按次计费 */
  QUANTITY = 2,
}

// ==================== 抽成类型 ====================
export enum CommissionType {
  /** 固定金额 */
  FIXED = 1,
  /** 比例 */
  PERCENTAGE = 2,
}

// ==================== 报备状态 ====================
export enum ReportStatus {
  /** 待审批 */
  PENDING = 1,
  /** 已通过 */
  APPROVED = 2,
  /** 已驳回 */
  REJECTED = 3,
  /** 已撤销 */
  CANCELLED = 4,
}

// ==================== 收入类型 ====================
export enum EarningType {
  /** 收入 */
  INCOME = 1,
  /** 返点 */
  REBATE = 2,
  /** 扣减 */
  DEDUCTION = 3,
}

// ==================== 收入状态 ====================
export enum EarningStatus {
  /** 待发放 */
  PENDING = 1,
  /** 已发放 */
  PAID = 2,
  /** 已取消 */
  CANCELLED = 3,
}

// ==================== 工资状态 ====================
export enum SalaryStatus {
  /** 待发放 */
  PENDING = 1,
  /** 发放中 */
  PROCESSING = 2,
  /** 已发放 */
  PAID = 3,
}

// ==================== 钱包状态 ====================
export enum WalletStatus {
  /** 正常 */
  ACTIVE = 1,
  /** 冻结 */
  FROZEN = 2,
}

// ==================== 审批流类型 ====================
export enum ApprovalFlowType {
  /** 仅通知 */
  NOTIFY_ONLY = 1,
  /** 提交至所属人 */
  TO_LEADER = 2,
  /** 提交至管理员 */
  TO_ADMIN = 3,
  /** 所属人+管理员双签 */
  DUAL_SIGN = 4,
}

// ==================== 权限枚举 (19项细分权限) ====================
export enum Permission {
  // 俱乐部管理
  CLUB_EDIT = 'club:edit',
  CLUB_TRANSFER = 'club:transfer',
  CLUB_DISSOLVE = 'club:dissolve',
  
  // 成员管理
  MEMBER_INVITE = 'member:invite',
  MEMBER_APPROVE = 'member:approve',
  MEMBER_REMOVE = 'member:remove',
  MEMBER_ROLE_EDIT = 'member:role_edit',
  
  // 项目管理
  PROJECT_CREATE = 'project:create',
  PROJECT_EDIT = 'project:edit',
  PROJECT_DELETE = 'project:delete',
  
  // 报备管理
  REPORT_APPROVE = 'report:approve',
  REPORT_REJECT = 'report:reject',
  REPORT_VIEW_ALL = 'report:view_all',
  
  // 财务管理
  FINANCE_VIEW = 'finance:view',
  FINANCE_SALARY = 'finance:salary',
  FINANCE_ADJUST = 'finance:adjust',
  
  // 数据导出
  DATA_EXPORT = 'data:export',
  DATA_STATISTICS = 'data:statistics',
}

// ==================== 默认角色权限映射 ====================
export const DEFAULT_ROLE_PERMISSIONS: Record<ClubRole, Permission[]> = {
  [1]: Object.values(Permission), // 创始人拥有所有权限
  [2]: [
    Permission.MEMBER_INVITE,
    Permission.MEMBER_APPROVE,
    Permission.MEMBER_REMOVE,
    Permission.MEMBER_ROLE_EDIT,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_EDIT,
    Permission.PROJECT_DELETE,
    Permission.REPORT_APPROVE,
    Permission.REPORT_REJECT,
    Permission.REPORT_VIEW_ALL,
    Permission.FINANCE_VIEW,
    Permission.FINANCE_SALARY,
    Permission.DATA_EXPORT,
    Permission.DATA_STATISTICS,
  ],
  [3]: [
    Permission.REPORT_APPROVE,
    Permission.REPORT_REJECT,
    Permission.REPORT_VIEW_ALL,
    Permission.FINANCE_VIEW,
  ],
  [4]: [
    Permission.FINANCE_VIEW,
  ],
};