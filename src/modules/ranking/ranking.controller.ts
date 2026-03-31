import { Controller, Get, Query } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  /**
   * 获取榜单列表
   */
  @Get('list')
  async getRankings(@Query() query: { clubId: string; rankType?: number; period?: string }) {
    return this.rankingService.findAll(
      BigInt(query.clubId),
      query.rankType ? Number(query.rankType) : undefined,
      query.period,
    );
  }
}
