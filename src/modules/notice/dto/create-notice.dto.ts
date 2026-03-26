import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min, Max } from 'class-validator';

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
  type?: number = 1; // 1 普通 2 重要 3 紧急

  @IsBoolean()
  @IsOptional()
  isTop?: boolean = false;

  @IsString()
  @IsOptional()
  expiresAt?: string;
}

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
  type?: number;

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
