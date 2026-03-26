import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  MaxLength,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 积分充值 DTO
 * 支持幂等性：通过 requestId 防止重复提交
 */
export class PointRechargeDto {
  /**
   * 幂等性请求 ID
   */
  @IsString()
  @MaxLength(64)
  @IsOptional()
  requestId?: string;

  /**
   * 接收人 ID（为空则为自己充值）
   */
  @IsString()
  @IsOptional()
  recipientId?: string;

  /**
   * 充值类型：1 为自己 2 为好友
   */
  @IsInt()
  @Min(1)
  @Max(2)
  @IsNotEmpty()
  rechargeType: number;

  /**
   * 充值积分数量
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  points: number;

  /**
   * 支付金额（可选，管理员赠送时为 0）
   */
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  payAmount?: number;

  /**
   * 支付方式：1 微信 2 支付宝 3 钱包余额 4 管理员赠送
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  @IsNotEmpty()
  payMethod: number;

  /**
   * 备注
   */
  @IsString()
  @MaxLength(500)
  @IsOptional()
  remark?: string;
}
