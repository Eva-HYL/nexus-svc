import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getStats(memberId: bigint, clubId: bigint, period?: { start: Date; end: Date }) {
    const where: any = { memberId, clubId, type: 1 };
    if (period) {
      where.createdAt = { gte: period.start, lte: period.end };
    }

    const earnings = await this.prisma.earning.findMany({ where });

    const totalAmount = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
    const paidAmount = earnings
      .filter((e) => e.status === 2)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const pendingAmount = earnings
      .filter((e) => e.status === 1)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return { totalAmount, paidAmount, pendingAmount, count: earnings.length };
  }

  async getEarningList(memberId: bigint, clubId: bigint, page = 1, pageSize = 20) {
    const where = { memberId, clubId };
    const [list, total] = await Promise.all([
      this.prisma.earning.findMany({
        where,
        include: { report: { select: { bossName: true, createdAt: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.earning.count({ where }),
    ]);
    return { list, pagination: { page, pageSize, total } };
  }

  async calculateSalary(memberId: bigint, clubId: bigint, periodStart: Date, periodEnd: Date) {
    const earnings = await this.prisma.earning.findMany({
      where: {
        memberId,
        clubId,
        type: 1,
        status: 1,
        createdAt: { gte: periodStart, lte: periodEnd },
      },
    });

    if (earnings.length === 0) {
      throw new BadRequestException('该周期内无待发放收入');
    }

    const totalAmount = earnings.reduce((sum, e) => sum + Number(e.amount), 0);

    return this.prisma.$transaction(async (tx) => {
      const salary = await tx.salary.create({
        data: {
          clubId,
          memberId,
          periodStart,
          periodEnd,
          totalAmount,
          actualAmount: totalAmount,
          status: 1,
        },
      });

      await tx.earning.updateMany({
        where: { id: { in: earnings.map((e) => e.id) } },
        data: { salaryId: salary.id },
      });

      return salary;
    });
  }

  async paySalary(salaryId: bigint, payerId: bigint) {
    const salary = await this.prisma.salary.findUnique({ where: { id: salaryId } });
    if (!salary || salary.status !== 1) {
      throw new BadRequestException('工资单状态异常');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.salary.update({
        where: { id: salaryId },
        data: { status: 3, paidBy: payerId, paidAt: new Date() },
      });
      await tx.earning.updateMany({
        where: { salaryId },
        data: { status: 2 },
      });
      return { success: true };
    });
  }

  async getSalaryList(clubId: bigint, memberId?: bigint, page = 1, pageSize = 20) {
    const where: any = { clubId };
    if (memberId) where.memberId = memberId;

    const [list, total] = await Promise.all([
      this.prisma.salary.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.salary.count({ where }),
    ]);
    return { list, pagination: { page, pageSize, total } };
  }
}
