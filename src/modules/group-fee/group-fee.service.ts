import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGroupFeeDto, PayGroupFeeDto } from './dto/create-group-fee.dto';

@Injectable()
export class GroupFeeService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取团费列表
   */
  async findAll(clubId: bigint, memberId?: bigint, period?: string) {
    const where: any = { clubId, deletedAt: null };
    if (memberId) where.memberId = memberId;
    if (period) where.period = period;

    const fees = await this.prisma.groupFee.findMany({
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
      orderBy: { period: 'desc' },
    });

    return fees.map((f) => ({
      ...f,
      memberName: f.member.user.nickname,
    }));
  }

  /**
   * 创建团费
   */
  async create(clubId: bigint, dto: CreateGroupFeeDto) {
    return this.prisma.groupFee.create({
      data: {
        clubId,
        memberId: BigInt(dto.memberId),
        type: dto.type,
        period: dto.period,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
      },
    });
  }

  /**
   * 缴纳团费
   */
  async pay(id: bigint, dto: PayGroupFeeDto) {
    const fee = await this.findById(id);

    if (Number(fee.status) !== 1) {
      throw new NotFoundException('团费状态异常');
    }

    return this.prisma.groupFee.update({
      where: { id },
      data: {
        status: 2, // PAID
        paidAt: new Date(),
        payMethod: dto.payMethod,
        paidBy: dto.paidById ? BigInt(dto.paidById) : fee.memberId,
      },
    });
  }

  /**
   * 根据 ID 查找团费
   */
  async findById(id: bigint) {
    const fee = await this.prisma.groupFee.findUnique({
      where: { id, deletedAt: null },
    });

    if (!fee) {
      throw new NotFoundException('团费不存在');
    }

    return fee;
  }
}
