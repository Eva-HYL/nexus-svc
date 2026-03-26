import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DepositStatus } from '@prisma/client';
import { CreateDepositDto, RefundDepositDto } from './dto/create-deposit.dto';

@Injectable()
export class DepositService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取存单列表
   */
  async findAll(clubId: bigint, memberId?: bigint, status?: number) {
    const where: any = { clubId, deletedAt: null };
    if (memberId) where.memberId = memberId;
    if (status) where.status = status;

    const deposits = await this.prisma.deposit.findMany({
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
      orderBy: { createdAt: 'desc' },
    });

    return deposits.map((d) => ({
      ...d,
      memberName: d.member.user.nickname,
    }));
  }

  /**
   * 创建存单
   */
  async create(clubId: bigint, createdById: bigint, dto: CreateDepositDto) {
    const statusMap: Record<number, DepositStatus> = {
      1: DepositStatus.FROZEN,
      2: DepositStatus.IN_USE,
      3: DepositStatus.USED_UP,
      4: DepositStatus.REFUNDED,
      5: DepositStatus.EXPIRED,
    };

    return this.prisma.deposit.create({
      data: {
        clubId,
        memberId: BigInt(dto.memberId),
        createdBy: createdById,
        type: dto.type || 1,
        amount: dto.amount,
        balance: dto.amount,
        status: statusMap[dto.type || 1],
        expiredToIncome: dto.expiredToIncome || false,
        expireDate: dto.expireDate ? new Date(dto.expireDate) : null,
        remark: dto.remark,
      },
    });
  }

  /**
   * 获取存单使用记录
   */
  async getUsage(depositId: bigint) {
    return this.prisma.depositUsage.findMany({
      where: { depositId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 申请退还存单
   */
  async refund(id: bigint, dto: RefundDepositDto) {
    const deposit = await this.findById(id);

    if (Number(deposit.balance) <= 0) {
      throw new NotFoundException('存单余额不足');
    }

    return this.prisma.deposit.update({
      where: { id },
      data: {
        status: DepositStatus.REFUNDED,
        balance: 0,
      },
    });
  }

  /**
   * 根据 ID 查找存单
   */
  async findById(id: bigint) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id, deletedAt: null },
    });

    if (!deposit) {
      throw new NotFoundException('存单不存在');
    }

    return deposit;
  }
}
