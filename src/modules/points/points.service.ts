import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RechargePointsDto, AdjustPointsDto } from './dto/points.dto';

export enum PointTransactionType {
  RECHARGE = 1,      // 充值
  DEDUCT = 2,        // 代扣
  REFUND = 3,        // 退款
  TRANSFER = 4,      // 转账
  EXPENSE = 5,       // 消费
  REWARD = 6,        // 奖励
  ADJUST = 7,        // 调账
  POOL_RECHARGE = 8, // 积分池充值
}

@Injectable()
export class PointsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取积分余额
   */
  async getBalance(clubId: bigint, memberId: bigint) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { clubId_userId: { clubId, userId: memberId } },
    });

    if (!wallet) {
      return { points: 0, balance: 0 };
    }

    return {
      points: Number(wallet.points),
      balance: Number(wallet.balance),
    };
  }

  /**
   * 积分充值（成员）
   */
  async recharge(clubId: bigint, memberId: bigint, dto: RechargePointsDto) {
    const { amount, points, payMethod } = dto;

    // TODO: 实际支付逻辑（微信支付等）
    // 这里先模拟充值成功

    return this.prisma.$transaction(async (tx) => {
      // 获取或创建钱包
      let wallet = await tx.wallet.findUnique({
        where: { clubId_userId: { clubId, userId: memberId } },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { clubId, userId: memberId, balance: 0, points: 0, status: 1 },
        });
      }

      // 更新积分
      const newPoints = Number(wallet.points) + points;
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { points: newPoints },
      });

      // 记录交易
      const transaction = await tx.pointTransaction.create({
        data: {
          walletId: wallet.id,
          type: PointTransactionType.RECHARGE,
          points,
          amount,
          payMethod,
          balance: newPoints,
          status: 1,
          remark: '积分充值',
        },
      });

      return {
        success: true,
        points: newPoints,
        transaction,
      };
    });
  }

  /**
   * 积分池充值（管理员）
   */
  async poolRecharge(clubId: bigint, dto: RechargePointsDto) {
    const { amount, points } = dto;

    // 创建俱乐部积分池钱包
    const poolWallet = await this.getOrCreatePoolWallet(clubId);

    return this.prisma.$transaction(async (tx) => {
      // 更新积分池积分
      const newPoints = Number(poolWallet.points) + points;
      await tx.wallet.update({
        where: { id: poolWallet.id },
        data: { points: newPoints },
      });

      // 记录交易
      const transaction = await tx.pointTransaction.create({
        data: {
          walletId: poolWallet.id,
          type: PointTransactionType.POOL_RECHARGE,
          points,
          amount,
          balance: newPoints,
          status: 1,
          remark: '积分池充值',
        },
      });

      return {
        success: true,
        points: newPoints,
        transaction,
      };
    });
  }

  /**
   * 人工调账（管理员）
   */
  async adjust(clubId: bigint, dto: AdjustPointsDto) {
    const { memberId, points, reason } = dto;

    if (points === 0) {
      throw new BadRequestException('调整积分不能为 0');
    }

    return this.prisma.$transaction(async (tx) => {
      // 获取用户钱包
      const wallet = await tx.wallet.findUnique({
        where: { clubId_userId: { clubId, userId: memberId } },
      });

      if (!wallet) {
        throw new BadRequestException('用户钱包不存在');
      }

      const isAdd = points > 0;
      const newPoints = Number(wallet.points) + points;

      if (!isAdd && newPoints < 0) {
        throw new BadRequestException('积分不足，无法扣减');
      }

      // 更新积分
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { points: newPoints },
      });

      // 记录交易
      const transaction = await tx.pointTransaction.create({
        data: {
          walletId: wallet.id,
          type: PointTransactionType.ADJUST,
          points: Math.abs(points),
          balance: newPoints,
          status: 1,
          remark: reason || (isAdd ? '管理员增加积分' : '管理员扣减积分'),
        },
      });

      return {
        success: true,
        points: newPoints,
        transaction,
      };
    });
  }

  /**
   * 积分流水
   */
  async getTransactions(
    clubId: bigint,
    memberId: bigint,
    page: number,
    pageSize: number,
  ) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { clubId_userId: { clubId, userId: memberId } },
    });

    if (!wallet) {
      return { list: [], total: 0 };
    }

    const [list, total] = await Promise.all([
      this.prisma.pointTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.pointTransaction.count({
        where: { walletId: wallet.id },
      }),
    ]);

    return {
      list: list.map((t) => ({
        ...t,
        points: Number(t.points),
        balance: Number(t.balance),
      })),
      pagination: { page, pageSize, total },
    };
  }

  /**
   * 获取或创建俱乐部积分池钱包
   */
  private async getOrCreatePoolWallet(clubId: bigint) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { clubId_userId: { clubId, userId: BigInt(0) } }, // userId=0 表示俱乐部积分池
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          clubId,
          userId: BigInt(0), // 特殊标识：俱乐部积分池
          balance: 0,
          points: 0,
          status: 1,
        },
      });
    }

    return wallet;
  }
}
