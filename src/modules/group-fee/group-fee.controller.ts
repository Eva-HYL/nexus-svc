import { Controller, Get, Post, Put, Query, Body, Param, Request } from '@nestjs/common';
import { GroupFeeService } from './group-fee.service';
import { CreateGroupFeeDto, PayGroupFeeDto } from './dto/create-group-fee.dto';

@Controller('api/fee/group')
export class GroupFeeController {
  constructor(private readonly groupFeeService: GroupFeeService) {}

  /**
   * 获取团费列表
   */
  @Get('list')
  async getGroupFees(@Query() query: { clubId: string; memberId?: string; period?: string }) {
    return this.groupFeeService.findAll(
      BigInt(query.clubId),
      query.memberId ? BigInt(query.memberId) : undefined,
      query.period,
    );
  }

  /**
   * 创建团费（管理员）
   */
  @Post('create')
  async createGroupFee(@Request() req: any, @Body() dto: CreateGroupFeeDto) {
    const { clubId } = req.user;
    return this.groupFeeService.create(BigInt(clubId), dto);
  }

  /**
   * 缴纳团费
   */
  @Post(':id/pay')
  async payGroupFee(@Param('id') id: string, @Body() dto: PayGroupFeeDto) {
    return this.groupFeeService.pay(BigInt(id), dto);
  }
}
