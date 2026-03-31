import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFineDto, PayFineDto } from './dto/create-fine.dto';

@Injectable()
export class FineService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取罚款列表
   */
  async findAll(clubId: bigint, memberId?: bigint, status?: number) {
    const where: any = { clubId, deletedAt: null };
    if (memberId) where.memberId = memberId;
    if (status) where.status = status;

    const fines = await this.prisma.fine.findMany({
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

    return fines.map((f) => ({
      ...f,
      memberName: f.member.user.nickname,
    }));
  }

  /**
   * 创建罚款
   */
  async create(clubId: bigint, issuedById: bigint, dto: CreateFineDto) {
    return this.prisma.fine.create({
      data: {
        clubId,
        memberId: BigInt(dto.memberId),
        issuedBy: issuedById,
        type: dto.type,
        reason: dto.reason,
        amount: dto.amount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });
  }

  /**
   * 缴纳罚款
   */
  async pay(id: bigint, dto: PayFineDto) {
    const fine = await this.findById(id);

    if (fine.status !== 'PENDING' && Number(fine.status) !== 1) {
      throw new NotFoundException('罚款状态异常');
    }

    return this.prisma.fine.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        payMethod: dto.payMethod,
        paidBy: dto.paidById ? BigInt(dto.paidById) : fine.memberId,
      },
    });
  }

  /**
   * 豁免罚款
   */
  async waive(id: bigint) {
    const fine = await this.findById(id);

    return this.prisma.fine.update({
      where: { id },
      data: {
        status: 'WAIVED',
      },
    });
  }

  /**
   * 根据 ID 查找罚款
   */
  async findById(id: bigint) {
    const fine = await this.prisma.fine.findUnique({
      where: { id, deletedAt: null },
    });

    if (!fine) {
      throw new NotFoundException('罚款不存在');
    }

    return fine;
  }
}
