import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FinanceService } from './finance.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('earning')
@UseGuards(AuthGuard('jwt'))
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Get('stats')
  getStats(
    @CurrentUser('id') userId: string,
    @Query('clubId') clubId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const period = startDate && endDate
      ? { start: new Date(startDate), end: new Date(endDate) }
      : undefined;
    return this.financeService.getStats(BigInt(userId), BigInt(clubId), period);
  }

  @Get('list')
  getList(
    @CurrentUser('id') userId: string,
    @Query('clubId') clubId: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.financeService.getEarningList(BigInt(userId), BigInt(clubId), +page, +pageSize);
  }

  @Post('salary/calculate')
  calculateSalary(
    @Body() body: { memberId: string; clubId: string; periodStart: string; periodEnd: string },
  ) {
    return this.financeService.calculateSalary(
      BigInt(body.memberId),
      BigInt(body.clubId),
      new Date(body.periodStart),
      new Date(body.periodEnd),
    );
  }

  @Post('salary/pay')
  paySalary(
    @CurrentUser('id') userId: string,
    @Body('salaryId') salaryId: string,
  ) {
    return this.financeService.paySalary(BigInt(salaryId), BigInt(userId));
  }

  @Get('salary/list')
  getSalaryList(
    @Query('clubId') clubId: string,
    @Query('memberId') memberId?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.financeService.getSalaryList(
      BigInt(clubId),
      memberId ? BigInt(memberId) : undefined,
      +page,
      +pageSize,
    );
  }
}
