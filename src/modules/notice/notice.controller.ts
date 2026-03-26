import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/create-notice.dto';
// Guards will be added later
// import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
// import { ClubMemberGuard } from '../../club/club-member.guard';

@Controller('api/notice')
// @UseGuards(JwtAuthGuard, ClubMemberGuard) // TODO: Add guards later
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  /**
   * 获取公告列表
   */
  @Get('list')
  async getNotices(@Query() query: { clubId: string; page?: number; pageSize?: number }) {
    return this.noticeService.findAll(
      BigInt(query.clubId),
      query.page || 1,
      query.pageSize || 20,
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
   * 创建公告（管理员）
   */
  @Post('create')
  async createNotice(@Request() req: any, @Body() dto: CreateNoticeDto) {
    const { clubId } = req.user;
    const publisherId = req.user.memberId;
    return this.noticeService.create(BigInt(clubId), BigInt(publisherId), dto);
  }

  /**
   * 更新公告（管理员）
   */
  @Put(':id')
  async updateNotice(@Param('id') id: string, @Body() dto: UpdateNoticeDto) {
    return this.noticeService.update(BigInt(id), dto);
  }

  /**
   * 删除公告（管理员）
   */
  @Delete(':id')
  async deleteNotice(@Param('id') id: string) {
    return this.noticeService.remove(BigInt(id));
  }
}
