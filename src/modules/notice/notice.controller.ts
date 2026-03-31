import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/create-notice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MemberRole } from '@prisma/client';

@Controller('notice')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  /**
   * 获取公告列表
   */
  @Get('list')
  async getNotices(@Query() query: { clubId: string; page?: number; pageSize?: number; type?: number }) {
    return this.noticeService.findAll(
      BigInt(query.clubId),
      query.page || 1,
      query.pageSize || 20,
      query.type ? Number(query.type) : undefined,
    );
  }

  /**
   * 获取公告详情
   */
  @Get(':id')
  async getNotice(@Param('id') id: string) {
    return this.noticeService.findById(BigInt(id));
  }

  /**
   * 创建公告（管理员及以上）
   */
  @Post('create')
  @Roles(MemberRole.ADMIN, MemberRole.OWNER)
  async createNotice(@Request() req: any, @Body() dto: CreateNoticeDto) {
    const { clubId } = req.user;
    const publisherId = req.user.memberId;
    return this.noticeService.create(BigInt(clubId), BigInt(publisherId), dto);
  }

  /**
   * 更新公告（管理员及以上）
   */
  @Put(':id')
  @Roles(MemberRole.ADMIN, MemberRole.OWNER)
  async updateNotice(@Param('id') id: string, @Body() dto: UpdateNoticeDto) {
    return this.noticeService.update(BigInt(id), dto);
  }

  /**
   * 删除公告（管理员及以上）
   */
  @Delete(':id')
  @Roles(MemberRole.ADMIN, MemberRole.OWNER)
  async deleteNotice(@Param('id') id: string) {
    return this.noticeService.remove(BigInt(id));
  }
}
