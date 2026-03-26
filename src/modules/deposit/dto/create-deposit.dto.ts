import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional, IsBoolean } from 'class-validator';

export class CreateDepositDto {
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @IsInt()
  @Min(1)
  @Max(2)
  type?: number = 1; // 1 存单 2 预存

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

export class RefundDepositDto {
  @IsString()
  @IsOptional()
  remark?: string;
}
