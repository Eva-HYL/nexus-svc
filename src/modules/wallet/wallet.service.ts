import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportStatus, MemberStatus, MemberRole } from '@prisma/client';

export enum WalletTransactionType {
  RECHARGE = 1,    // 充值
  DEDUCT = 2,      // 代扣
  REFUND = 3,      // 退款
  WITHDRAW = 4,    // 提现
  ADJUST_ADD = 5,  // 调账增加
  ADJUST_SUB = 6,  // 调账减少
}

export enum WalletTransactionStatus {
  SUCCESS = 1,
  FAILED = 2,
  PROCESSING = 3,
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 获取或创建用户钱包
   */
  async getOrCreateWallet(clubId: bigint, userId: bigint) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: { clubId, userId, balance: 0, frozen: 0, status: 1 },
      });
      this.logger.log(`创建钱包: club=${clubId}, user=${userId}`);
    }

    return wallet;
  }

  /**
   * 查询钱包余额
   */
  async getBalance(clubId: bigint, userId: bigint) {
    const wallet = await this.getOrCreateWallet(clubId, userId);
    return {
      balance: wallet.balance.toString(),
      frozen: wallet.frozen.toString(),
      total: (Number(wallet.balance) + Number(wallet.frozen)).toString(),
    };
  }

  /**
   * 充值
   */
  async recharge(clubId: bigint, userId: bigint, amount: number, operatorId: bigint, remark?: string) {
    if (amount <= 0) {
      throw new BadRequestException('充值金额必须大于0');
    }

    return this.prisma.$transaction(async (tx) => {
      const wallet = await this.getOrCreateWallet(clubId, userId);
      
      // 更新余额
      const newBalance = Number(wallet.balance) + amount;
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      // 记录交易
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTransactionType.RECHARGE,
          amount,
          balance: newBalance,
          status: WalletTransactionStatus.SUCCESS,
          remark: remark || '充值',
          createdBy: operatorId,
        },
      });

      this.logger.log(`充值成功: user=${userId}, amount=${amount}`);
      return transaction;
    });
  }

  /**
   * 代扣（报备时自动扣减）
   */
  async deduct(clubId: bigint, userId: bigint, amount: number, relateId?: bigint, relateType?: string) {
    if (amount <= 0) {
      return null; // 无需扣款
    }

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { clubId_userId: { clubId, userId } },
      });

      if (!wallet) {
        throw new NotFoundException('钱包不存在');
      }

      if (Number(wallet.balance) < amount) {
        throw new BadRequestException('余额不足');
      }

      // 更新余额
      const newBalance = Number(wallet.balance) - amount;
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      // 记录交易
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTransactionType.DEDUCT,
          amount,
          balance: newBalance,
          status: WalletTransactionStatus.SUCCESS,
          relateId,
          relateType,
          remark: relateType === 'report' ? '报备代扣' : '代扣',
        },
      });

      this.logger.log(`代扣成功: user=${userId}, amount=${amount}`);
      return transaction;
    });
  }

  /**
   * 退款
   */
  async refund(clubId: bigint, userId: bigint, amount: number, relateId?: bigint, remark?: string) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await this.getOrCreateWallet(clubId, userId);
      
      // 更新余额
      const newBalance = Number(wallet.balance) + amount;
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      // 记录交易
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTransactionType.REFUND,
          amount,
          balance: newBalance,
          status: WalletTransactionStatus.SUCCESS,
          relateId,
          remark: remark || '退款',
        },
      });

      this.logger.log(`退款成功: user=${userId}, amount=${amount}`);
      return transaction;
    });
  }

  /**
   * 管理员调账
   */
  async adjust(
    clubId: bigint, 
    userId: bigint, 
    amount: number, 
    operatorId: bigint,
    remark?: string
  ) {
    if (amount === 0) {
      throw new BadRequestException('调整金额不能为0');
    }

    const isAdd = amount > 0;

    return this.prisma.$transaction(async (tx) => {
      const wallet = await this.getOrCreateWallet(clubId, userId);
      
      let newBalance = Number(wallet.balance);
      
      if (isAdd) {
        newBalance += amount;
      } else {
        if (newBalance < Math.abs(amount)) {
          throw new BadRequestException('余额不足，无法扣减');
        }
        newBalance += amount; // amount 是负数
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: isAdd ? WalletTransactionType.ADJUST_ADD : WalletTransactionType.ADJUST_SUB,
          amount: Math.abs(amount),
          balance: newBalance,
          status: WalletTransactionStatus.SUCCESS,
          remark: remark || (isAdd ? '管理员充值' : '管理员扣款'),
          createdBy: operatorId,
        },
      });

      this.logger.log(`调账成功: user=${userId}, amount=${amount}, operator=${operatorId}`);
      return transaction;
    });
  }

  /**
   * 查询交易记录
   */
  async getTransactions(clubId: bigint, userId: bigint, query: {
    type?: number;
    page?: number;
    pageSize?: number;
  }) {
    const { type, page = 1, pageSize = 20 } = query;
    
    const wallet = await this.getOrCreateWallet(clubId, userId);
    
    const where: any = { walletId: wallet.id };
    if (type) where.type = type;

    const [list, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);

    return { 
      list: list.map(t => ({
        ...t,
        amount: t.amount.toString(),
        balance: t.balance.toString(),
      })), 
      pagination: { page, pageSize, total } 
    };
  }

  /**
   * 检查余额是否足够
   */
  async checkBalance(clubId: bigint, userId: bigint, amount: number): Promise<boolean> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });
    
    if (!wallet) return false;
    return Number(wallet.balance) >= amount;
  }

  /**
   * 检查最低余额门槛
   */
  async checkMinBalance(clubId: bigint, userId: bigint): Promise<{ pass: boolean; balance: number; minBalance: number }> {
    const config = await this.prisma.clubConfig.findUnique({
      where: { clubId },
    });

    const minBalance = config?.minBalance ? Number(config.minBalance) : 0;
    
    const wallet = await this.prisma.wallet.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });

    const balance = wallet ? Number(wallet.balance) : 0;

    return {
      pass: balance >= minBalance,
      balance,
      minBalance,
    };
  }
}