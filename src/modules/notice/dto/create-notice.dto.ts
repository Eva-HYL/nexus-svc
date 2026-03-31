import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { NoticeType } from '@prisma/client';

/**
 * 创建公告 DTO
 */
export class CreateNoticeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  @Min(1)
  @Max(3)
  @IsOptional()
  type?: NoticeType = NoticeType.NORMAL; // 1 普通 2 重要 3 紧急

  @IsBoolean()
  @IsOptional()
  isTop?: boolean = false;

  @IsString()
  @IsOptional()
  expiresAt?: string;
}

/**
 * 更新公告 DTO
 */
export class UpdateNoticeDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsInt()
  @Min(1)
  @Max(3)
  @IsOptional()
  type?: NoticeType;

  @IsBoolean()
  @IsOptional()
  isTop?: boolean;

  @IsString()
  @IsOptional()
  expiresAt?: string;

  @IsInt()
  @Min(1)
  @Max(2)
  @IsOptional()
  status?: number;
}
