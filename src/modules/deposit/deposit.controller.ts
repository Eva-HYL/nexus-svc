import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { CreateDepositDto, RefundDepositDto } from './dto/create-deposit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MemberRole } from '@prisma/client';

@Controller('deposit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  /**
   * 获取存单列表
   */
  @Get('list')
  async getDeposits(@Query() query: { clubId: string; memberId?: string; status?: number }) {
    return this.depositService.findAll(
      BigInt(query.clubId),
      query.memberId ? BigInt(query.memberId) : undefined,
      query.status ? Number(query.status) : undefined,
    );
  }

  /**
   * 获取存单详情
   */
  @Get(':id')
  async getDeposit(@Param('id') id: string) {
    return this.depositService.findById(BigInt(id));
  }

  /**
   * 创建存单（组长及以上）
   */
  @Post('create')
  @Roles(MemberRole.LEADER, MemberRole.ADMIN, MemberRole.OWNER)
  async createDeposit(@Request() req: any, @Body() dto: CreateDepositDto) {
    const { clubId } = req.user;
    const createdById = req.user.memberId;
    return this.depositService.create(BigInt(clubId), BigInt(createdById), dto);
  }

  /**
   * 获取存单使用记录
   */
  @Get(':id/usage')
  async getDepositUsage(@Param('id') id: string) {
    return this.depositService.getUsage(BigInt(id));
  }

  /**
   * 申请退还存单（管理员及以上）
   */
  @Post(':id/refund')
  @Roles(MemberRole.ADMIN, MemberRole.OWNER)
  async refundDeposit(@Param('id') id: string, @Body() dto: RefundDepositDto) {
    return this.depositService.refund(BigInt(id), dto);
  }
}
