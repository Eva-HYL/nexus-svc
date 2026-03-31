import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional } from 'class-validator';
import { FineType, FineStatus } from '@prisma/client';

/**
 * 创建罚款 DTO
 */
export class CreateFineDto {
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @IsInt()
  @Min(1)
  @Max(4)
  @IsOptional()
  type?: FineType = FineType.VIOLATION; // 1 违规 2 迟到 3 投诉 4 其他

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsInt()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  dueDate?: string;
}

/**
 * 缴纳罚款 DTO
 */
export class PayFineDto {
  @IsInt()
  @Min(1)
  @Max(4)
  payMethod: number; // 1 微信 2 支付宝 3 钱包 4 现金

  @IsString()
  @IsOptional()
  paidById?: string;
}
