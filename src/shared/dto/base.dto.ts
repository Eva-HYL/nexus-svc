/**
 * DTO 基类和通用 DTO
 */
import { IsInt, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 分页查询基类
 */
export class PaginationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize?: number = 20;
}

/**
 * ID 参数 DTO
 */
export class IdDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}

/**
 * 时间范围查询 DTO
 */
export class DateRangeDto {
  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;
}