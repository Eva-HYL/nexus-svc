import { ReportType, OrderType } from '@prisma/client';
import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';


/**
 * 查询报备列表 DTO
 * 支持完整筛选条件
 */
export class QueryReportDto {
  /**
   * Tab 筛选
   */
  @IsString()
  @IsOptional()
  tab?: 'pending' | 'my-orders' | 'my-point-orders' | 'all';

  /**
   * 时间范围类型
   */
  @IsString()
  @IsOptional()
  period?: 'all' | 'month' | 'week' | 'today' | 'custom';

  /**
   * 开始日期
   */
  @IsDateString()
  @IsOptional()
  startDate?: string;

  /**
   * 结束日期
   */
  @IsDateString()
  @IsOptional()
  endDate?: string;

  /**
   * 报备类型
   */
  @IsEnum(ReportType)
  @IsOptional()
  reportType?: ReportType;

  /**
   * 订单类型
   */
  @IsEnum(OrderType)
  @IsOptional()
  orderType?: OrderType;

  /**
   * 状态筛选（多选）
   */
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  statuses?: number[];

  /**
   * 接单人 ID
   */
  @IsString()
  @IsOptional()
  receiverId?: string;

  /**
   * 所属人 ID
   */
  @IsString()
  @IsOptional()
  ownerId?: string;

  /**
   * 群组 ID
   */
  @IsString()
  @IsOptional()
  groupId?: string;

  /**
   * 有无备注
   */
  @IsBoolean()
  @IsOptional()
  hasRemark?: boolean;

  /**
   * 备注内容搜索
   */
  @IsString()
  @IsOptional()
  remarkContains?: string;

  /**
   * 是否使用存单
   */
  @IsBoolean()
  @IsOptional()
  useDeposit?: boolean;

  /**
   * 老板姓名搜索
   */
  @IsString()
  @IsOptional()
  bossName?: string;

  /**
   * 关键词搜索（订单号/老板姓名）
   */
  @IsString()
  @IsOptional()
  keyword?: string;

  /**
   * 页码
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  /**
   * 每页数量
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize?: number = 20;
}
