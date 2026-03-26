import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 积分记录查询 DTO
 */
export class PointQueryDto {
  /**
   * 交易类型筛选
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  @IsOptional()
  type?: number;

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
