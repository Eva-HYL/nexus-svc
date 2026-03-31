import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional } from 'class-validator';
import { GroupFeeType } from '@prisma/client';

/**
 * 创建团费 DTO
 */
export class CreateGroupFeeDto {
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @IsInt()
  @Min(1)
  @Max(4)
  @IsOptional()
  type?: GroupFeeType = GroupFeeType.MONTHLY; // 1 月费 2 季度费 3 年费 4 活动费

  @IsString()
  @IsNotEmpty()
  period: string; // 如 "2026-03" 或 "2026-Q1"

  @IsInt()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  dueDate: string;
}

/**
 * 缴纳团费 DTO
 */
export class PayGroupFeeDto {
  @IsInt()
  @Min(1)
  @Max(4)
  payMethod: number; // 1 微信 2 支付宝 3 钱包 4 现金

  @IsString()
  @IsOptional()
  paidById?: string;
}
