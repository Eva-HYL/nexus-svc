import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { FineService } from './fine.service';
import { CreateFineDto, PayFineDto } from './dto/create-fine.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MemberRole } from '@prisma/client';

@Controller('fine')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FineController {
  constructor(private readonly fineService: FineService) {}

  /**
   * 获取罚款列表
   */
  @Get('list')
  async getFines(@Query() query: { clubId: string; memberId?: string; status?: number }) {
    return this.fineService.findAll(
      BigInt(query.clubId),
      query.memberId ? BigInt(query.memberId) : undefined,
      query.status ? Number(query.status) : undefined,
    );
  }

  /**
   * 创建罚款（组长及以上）
   */
  @Post('create')
  @Roles(MemberRole.LEADER, MemberRole.ADMIN, MemberRole.OWNER)
  async createFine(@Request() req: any, @Body() dto: CreateFineDto) {
    const { clubId } = req.user;
    const issuedById = req.user.memberId;
    return this.fineService.create(BigInt(clubId), BigInt(issuedById), dto);
  }

  /**
   * 缴纳罚款
   */
  @Post(':id/pay')
  async payFine(@Param('id') id: string, @Body() dto: PayFineDto) {
    return this.fineService.pay(BigInt(id), dto);
  }

  /**
   * 豁免罚款（管理员及以上）
   */
  @Put(':id/waive')
  @Roles(MemberRole.ADMIN, MemberRole.OWNER)
  async waiveFine(@Param('id') id: string) {
    return this.fineService.waive(BigInt(id));
  }
}
