import { Controller, Get, Post, Put, Query, Body, Param, Request } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { CreateDepositDto, RefundDepositDto } from './dto/create-deposit.dto';

@Controller('api/deposit')
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
   * 创建存单
   */
  @Post('create')
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
   * 申请退还存单
   */
  @Post(':id/refund')
  async refundDeposit(@Param('id') id: string, @Body() dto: RefundDepositDto) {
    return this.depositService.refund(BigInt(id), dto);
  }
}
