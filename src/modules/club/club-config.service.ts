import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClubConfigService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取俱乐部配置
   */
  async getConfig(clubId: bigint) {
    let config = await this.prisma.clubConfig.findUnique({
      where: { clubId },
    });

    // 如果不存在，创建默认配置
    if (!config) {
      config = await this.prisma.clubConfig.create({
        data: { clubId },
      });
    }

    return config;
  }

  /**
   * 更新俱乐部配置
   */
  async updateConfig(clubId: bigint, data: {
    autoDeduct?: boolean;
    minBalance?: number;
    approvalMode?: number;
    withdrawFeeRate?: number;
    minWithdrawAmount?: number;
  }) {
    // 确保配置存在
    await this.getConfig(clubId);

    return this.prisma.clubConfig.update({
      where: { clubId },
      data: {
        autoDeduct: data.autoDeduct,
        minBalance: data.minBalance,
        approvalMode: data.approvalMode,
        withdrawFeeRate: data.withdrawFeeRate,
        minWithdrawAmount: data.minWithdrawAmount,
      },
    });
  }

  /**
   * 获取审批模式
   */
  async getApprovalMode(clubId: bigint): Promise<number> {
    const config = await this.getConfig(clubId);
    return config.approvalMode ?? 1;
  }

  /**
   * 检查是否启用自动代扣
   */
  async isAutoDeductEnabled(clubId: bigint): Promise<boolean> {
    const config = await this.getConfig(clubId);
    return config.autoDeduct ?? false;
  }
}