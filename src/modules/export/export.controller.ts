import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

class ExportQueryDto {
  @IsString()
  @IsNotEmpty()
  clubId: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  status?: number;
}

@Controller('export')
@UseGuards(AuthGuard('jwt'))
export class ExportController {
  constructor(private exportService: ExportService) {}

  /**
   * 导出报备数据
   * GET /api/export/reports
   */
  @Get('reports')
  async exportReports(@Query() query: ExportQueryDto, @Res() res: Response) {
    const workbook = await this.exportService.exportReports(BigInt(query.clubId), {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      status: query.status,
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=reports_${Date.now()}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * 导出积分流水
   * GET /api/export/wallet
   */
  @Get('wallet')
  async exportWallet(@Query() query: ExportQueryDto, @Res() res: Response) {
    const workbook = await this.exportService.exportWalletTransactions(BigInt(query.clubId), {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      type: query.status, // 复用 status 参数作为 type
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=wallet_${Date.now()}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * 导出工资台账
   * GET /api/export/salaries
   */
  @Get('salaries')
  async exportSalaries(@Query('clubId') clubId: string, @Res() res: Response) {
    const workbook = await this.exportService.exportSalaries(BigInt(clubId));

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=salaries_${Date.now()}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}