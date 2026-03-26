import { Controller, Get, Post, Put, Query, Body, Param, Request } from '@nestjs/common';
import { FineService } from './fine.service';
import { CreateFineDto, PayFineDto } from './dto/create-fine.dto';

@Controller('api/fine')
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
   * 创建罚款（管理员）
   */
  @Post('create')
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
   * 豁免罚款（管理员）
   */
  @Put(':id/waive')
  async waiveFine(@Param('id') id: string) {
    return this.fineService.waive(BigInt(id));
  }
}
