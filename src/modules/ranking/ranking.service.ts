import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RankingService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取榜单列表
   */
  async findAll(clubId: bigint, rankType?: number, period?: string) {
    const where: any = { clubId };
    if (rankType) where.rankType = rankType;
    if (period) where.period = period;

    const rankings = await this.prisma.clubRanking.findMany({
      where,
      include: {
        member: {
          select: {
            user: {
              select: {
                nickname: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: [{ rankType: 'asc' }, { rank: 'asc' }],
    });

    return rankings.map((r) => ({
      ...r,
      memberName: r.member.user.nickname,
      memberAvatar: r.member.user.avatar,
    }));
  }

  /**
   * 计算榜单（定时任务调用）
   */
  async calculateRankings(clubId: bigint, period: string) {
    // TODO: 实现榜单计算逻辑
    // 从业绩、接单量等数据计算排名
    return { success: true, message: '榜单计算完成' };
  }
}
