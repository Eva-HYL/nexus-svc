import { ReportType, OrderType } from '@prisma/client';
import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
  Min,
  Max,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';


/**
 * 提交报备 DTO
 * 支持幂等性：通过 requestId 防止重复提交
 */
export class SubmitReportDto {
  /**
   * 幂等性请求 ID
   * 客户端生成的唯一标识，防止重复提交
   */
  @IsString()
  @MaxLength(64)
  @IsOptional()
  requestId?: string;

  /**
   * 报备类型
   */
  @IsEnum(ReportType)
  @IsNotEmpty()
  reportType: ReportType;

  /**
   * 订单类型
   */
  @IsEnum(OrderType)
  @IsNotEmpty()
  orderType: OrderType;

  /**
   * 项目 ID
   */
  @IsString()
  @IsNotEmpty()
  projectId: string;

  /**
   * 所属人 ID（点单必填）
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
   * 老板姓名
   */
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  bossName: string;

  /**
   * 老板联系方式
   */
  @IsString()
  @MaxLength(100)
  @IsOptional()
  bossContact?: string;

  /**
   * 时长（分钟，按时长计费）
   */
  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;

  /**
   * 数量（按次计费）
   */
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  /**
   * 折算单量
   */
  @IsInt()
  @Min(0)
  @IsOptional()
  convertedCount?: number;

  /**
   * 使用存单
   */
  @IsBoolean()
  @IsOptional()
  useDeposit?: boolean = false;

  /**
   * 存单 ID
   */
  @IsString()
  @IsOptional()
  depositId?: string;

  /**
   * 开始时间
   */
  @IsDateString()
  @IsOptional()
  startTime?: string;

  /**
   * 结束时间
   */
  @IsDateString()
  @IsOptional()
  endTime?: string;

  /**
   * 备注
   */
  @IsString()
  @MaxLength(500)
  @IsOptional()
  remark?: string;
}
