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

    // 如果配置不存在，创建默认配置
    if (!config) {
      config = await this.prisma.clubConfig.create({
        data: {
          clubId,
          autoDeduct: false,
          minBalance: 0,
          approvalMode: 1,
          withdrawFeeRate: 0,
          minWithdrawAmount: 100,
          pointOrderOwnerRate: 30,
          pointOrderReceiverRate: 60,
          pointOrderClubRate: 10,
        },
      });
    }

    return config;
  }

  /**
   * 更新俱乐部配置
   */
  async updateConfig(clubId: bigint, dto: any) {
    const config = await this.getConfig(clubId);

    return this.prisma.clubConfig.update({
      where: { clubId },
      data: dto,
    });
  }

  /**
   * 更新积分代扣开关
   */
  async updateAutoDeduct(
    clubId: bigint,
    enabled: boolean,
    minBalance?: number,
  ) {
    const config = await this.getConfig(clubId);

    return this.prisma.clubConfig.update({
      where: { clubId },
      data: {
        autoDeduct: enabled,
        minBalance: minBalance !== undefined ? minBalance : config.minBalance,
      },
    });
  }

  /**
   * 更新审批模式
   * 1-仅通知 2-所属人 3-管理员 4-双签
   */
  async updateApprovalMode(clubId: bigint, mode: number) {
    if (mode < 1 || mode > 4) {
      throw new Error('审批模式无效');
    }

    return this.prisma.clubConfig.update({
      where: { clubId },
      data: { approvalMode: mode },
    });
  }
}
