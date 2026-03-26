import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';

/**
 * 审批报备 DTO
 */
export class ApproveReportDto {
  /**
   * 审批备注
   */
  @IsString()
  @MaxLength(500)
  @IsOptional()
  remark?: string;
}

/**
 * 驳回报备 DTO
 */
export class RejectReportDto {
  /**
   * 驳回原因（必填）
   */
  @IsString()
  @MaxLength(500)
  @IsNotEmpty()
  reason: string;
}
