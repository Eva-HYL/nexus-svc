import { IsInt, IsOptional, IsString, Min, IsNumber } from 'class-validator';

export class RechargePointsDto {
  @IsNumber()
  @Min(0.01)
  amount: number; // 充值金额（元）

  @IsInt()
  @Min(1)
  points: number; // 充值积分

  @IsInt()
  @Min(1)
  @Max(3)
  @IsOptional()
  payMethod?: number; // 支付方式 1 微信 2 支付宝 3 钱包
}

export class AdjustPointsDto {
  @IsInt()
  @Min(1)
  memberId: number; // 成员 ID

  @IsInt()
  points: number; // 调整积分（正数增加，负数减少）

  @IsString()
  @IsOptional()
  reason?: string; // 调整原因
}
