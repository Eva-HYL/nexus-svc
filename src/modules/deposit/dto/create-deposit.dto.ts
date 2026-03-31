import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional, IsBoolean } from 'class-validator';
import { DepositType } from '@prisma/client';

/**
 * 创建存单 DTO
 */
export class CreateDepositDto {
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @IsInt()
  @Min(1)
  @Max(2)
  @IsOptional()
  type?: DepositType = DepositType.DEPOSIT; // 1 存单 2 预存

  @IsInt()
  @Min(0)
  amount: number;

  @IsBoolean()
  @IsOptional()
  expiredToIncome?: boolean = false;

  @IsString()
  @IsOptional()
  expireDate?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 退还存单 DTO
 */
export class RefundDepositDto {
  @IsString()
  @IsOptional()
  remark?: string;
}
