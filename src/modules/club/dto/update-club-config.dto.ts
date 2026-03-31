import { IsBoolean, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateClubConfigDto {
  @IsBoolean()
  @IsOptional()
  autoDeduct?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minBalance?: number;

  @IsNumber()
  @Min(1)
  @Max(4)
  @IsOptional()
  approvalMode?: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  withdrawFeeRate?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minWithdrawAmount?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  pointOrderOwnerRate?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  pointOrderReceiverRate?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  pointOrderClubRate?: number;
}
