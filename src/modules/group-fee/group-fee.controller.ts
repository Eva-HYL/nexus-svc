import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { GroupFeeService } from './group-fee.service';
import { CreateGroupFeeDto, PayGroupFeeDto } from './dto/create-group-fee.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MemberRole } from '@prisma/client';

@Controller('fee/group')
@UseGuards(JwtAuthGuard, RolesGuard)
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
   * 创建团费（组长及以上）
   */
  @Post('create')
  @Roles(MemberRole.LEADER, MemberRole.ADMIN, MemberRole.OWNER)
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
