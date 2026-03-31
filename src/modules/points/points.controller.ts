import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PointsService } from './points.service';
import { RechargePointsDto, AdjustPointsDto } from './dto/points.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MemberRole } from '@prisma/client';

@Controller('api/points')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  /**
   * 获取积分余额
   * GET /api/points/balance
   */
  @Get('balance')
  async getBalance(@Request() req: any) {
    const { clubId, memberId } = req.user;
    return this.pointsService.getBalance(clubId, memberId);
  }

  /**
   * 积分充值（成员）
   * POST /api/points/recharge
   */
  @Post('recharge')
  @HttpCode(HttpStatus.OK)
  async recharge(@Request() req: any, @Body() dto: RechargePointsDto) {
    const { clubId, memberId } = req.user;
    return this.pointsService.recharge(clubId, memberId, dto);
  }

  /**
   * 积分池充值（管理员）
   * POST /api/points/pool-recharge
   */
  @Post('pool-recharge')
  @HttpCode(HttpStatus.OK)
  @Roles(MemberRole.ADMIN, MemberRole.OWNER)
  async poolRecharge(@Request() req: any, @Body() dto: RechargePointsDto) {
    const { clubId } = req.user;
    return this.pointsService.poolRecharge(clubId, dto);
  }

  /**
   * 人工调账（管理员）
   * POST /api/points/adjust
   */
  @Post('adjust')
  @HttpCode(HttpStatus.OK)
  @Roles(MemberRole.ADMIN, MemberRole.OWNER)
  async adjust(@Request() req: any, @Body() dto: AdjustPointsDto) {
    const { clubId } = req.user;
    return this.pointsService.adjust(clubId, dto);
  }

  /**
   * 积分流水
   * GET /api/points/transactions
   */
  @Get('transactions')
  async getTransactions(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ) {
    const { clubId, memberId } = req.user;
    return this.pointsService.getTransactions(clubId, memberId, page, pageSize);
  }
}
