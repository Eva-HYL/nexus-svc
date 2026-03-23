import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportService } from './report.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('report')
@UseGuards(AuthGuard('jwt'))
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Post('submit')
  submit(
    @CurrentUser('id') userId: string,
    @Body() body: { clubId: string; projectId: string; duration?: number; quantity?: number; bossName: string; remark?: string },
  ) {
    const { clubId, ...dto } = body;
    return this.reportService.submit(BigInt(userId), BigInt(clubId), dto);
  }

  @Get('list')
  findAll(
    @Query('clubId') clubId: string,
    @Query('memberId') memberId?: string,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.reportService.findAll(BigInt(clubId), {
      memberId,
      status: status ? +status : undefined,
      page: +page,
      pageSize: +pageSize,
    });
  }

  @Get('pending')
  findPending(@Query('clubId') clubId: string) {
    return this.reportService.findPending(BigInt(clubId));
  }

  @Post('approve')
  approve(
    @CurrentUser('id') userId: string,
    @Body('reportId') reportId: string,
  ) {
    return this.reportService.approve(BigInt(reportId), BigInt(userId));
  }

  @Post('reject')
  reject(
    @CurrentUser('id') userId: string,
    @Body() body: { reportId: string; reason?: string },
  ) {
    return this.reportService.reject(BigInt(body.reportId), BigInt(userId), body.reason);
  }
}
