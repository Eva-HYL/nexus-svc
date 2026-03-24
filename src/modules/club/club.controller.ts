import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClubService } from './club.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ClubRole, MemberStatus } from '../../common/constants';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsInt, IsPositive } from 'class-validator';

// DTO 定义
class CreateClubDto {
  @IsString()
  @IsNotEmpty({ message: '俱乐部名称不能为空' })
  name: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  depositAmount?: number;
}

class UpdateClubDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

class TransferClubDto {
  @IsNumber()
  @IsPositive({ message: '新所有者ID必须为正数' })
  newOwnerId: number;
}

@Controller('club')
@UseGuards(AuthGuard('jwt'))
export class ClubController {
  constructor(private clubService: ClubService) {}

  /**
   * 创建俱乐部
   * POST /api/club/create
   */
  @Post('create')
  create(@CurrentUser('id') userId: string, @Body() dto: CreateClubDto) {
    return this.clubService.create(BigInt(userId), dto);
  }

  /**
   * 获取我的俱乐部列表
   * GET /api/club/list
   */
  @Get('list')
  myClubs(@CurrentUser('id') userId: string) {
    return this.clubService.findByUser(BigInt(userId));
  }

  /**
   * 获取俱乐部详情
   * GET /api/club/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubService.findById(BigInt(id));
  }

  /**
   * 更新俱乐部信息
   * PUT /api/club/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClubDto,
    @CurrentUser('id') userId: string,
  ) {
    // TODO: 添加权限守卫，只有创始人/管理员可以修改
    return this.clubService.update(BigInt(id), dto);
  }

  /**
   * 转让俱乐部
   * POST /api/club/:id/transfer
   */
  @Post(':id/transfer')
  async transfer(
    @Param('id') id: string,
    @Body() dto: TransferClubDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.clubService.transfer(BigInt(id), BigInt(userId), BigInt(dto.newOwnerId));
  }

  /**
   * 解散俱乐部
   * DELETE /api/club/:id
   */
  @Delete(':id')
  async dissolve(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.clubService.dissolve(BigInt(id), BigInt(userId));
  }

  /**
   * 退出俱乐部
   * POST /api/club/:id/quit
   */
  @Post(':id/quit')
  async quit(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.clubService.quit(BigInt(id), BigInt(userId));
  }
}