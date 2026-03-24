import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectService } from '../project/project.service';

@Injectable()
export class ReportService {
  constructor(
    private prisma: PrismaService,
    private projectService: ProjectService,
  ) {}

  async submit(memberId: bigint, clubId: bigint, dto: {
    projectId: string;
    duration?: number;
    quantity?: number;
    bossName: string;
    remark?: string;
  }) {
    const project = await this.projectService.findById(BigInt(dto.projectId));

    // 计算金额
    const baseAmount = dto.duration
      ? Number(project.price) * (dto.duration / 60)
      : Number(project.price) * (dto.quantity || 1);

    // 计算抽成
    const commission = project.commissionType === 1
      ? Number(project.commissionValue)
      : baseAmount * (Number(project.commissionValue) / 100);

    const actualAmount = baseAmount - commission;

    // 创建报备（事务）
    return this.prisma.$transaction(async (tx) => {
      const report = await tx.report.create({
        data: {
          clubId,
          memberId,
          projectId: BigInt(dto.projectId),
          duration: dto.duration,
          quantity: dto.quantity,
          bossName: dto.bossName,
          amount: baseAmount,
          commission,
          actualAmount,
          status: 1,
          remark: dto.remark,
          createdBy: memberId,
        },
      });

      // 创建收入记录
      await tx.earning.create({
        data: {
          clubId,
          memberId,
          reportId: report.id,
          type: 1,
          amount: actualAmount,
          status: 1,
        },
      });

      return report;
    });
  }

  async findAll(clubId: bigint, query: {
    memberId?: string;
    status?: number;
    page?: number;
    pageSize?: number;
  }) {
    const { memberId, status, page = 1, pageSize = 20 } = query;
    const where: any = { clubId };
    if (memberId) where.memberId = BigInt(memberId);
    if (status) where.status = status;

    const [list, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          project: { select: { name: true } },
          creator: { select: { nickname: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.report.count({ where }),
    ]);

    return { list, pagination: { page, pageSize, total } };
  }

  async findPending(clubId: bigint) {
    return this.prisma.report.findMany({
      where: { clubId, status: 1 },
      include: {
        project: { select: { name: true } },
        creator: { select: { nickname: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approve(reportId: bigint, approverId: bigint) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report || report.status !== 1) {
      throw new BadRequestException('报备状态异常，无法审批');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.report.update({
        where: { id: reportId },
        data: { status: 2, approvedBy: approverId, approvedAt: new Date() },
      });
      await tx.earning.updateMany({
        where: { reportId },
        data: { status: 1 },
      });
      return { success: true };
    });
  }

  async reject(reportId: bigint, approverId: bigint, reason?: string) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report || report.status !== 1) {
      throw new BadRequestException('报备状态异常，无法驳回');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.report.update({
        where: { id: reportId },
        data: { status: 3, approvedBy: approverId, remark: reason },
      });
      await tx.earning.updateMany({
        where: { reportId },
        data: { status: 3 },
      });
      return { success: true };
    });
  }

  /**
   * 撤销报备（仅限待审批状态，且只能撤销自己的报备）
   */
  async cancel(reportId: bigint, memberId: bigint) {
    const report = await this.prisma.report.findUnique({ 
      where: { id: reportId },
      include: { earnings: true },
    });
    
    if (!report) {
      throw new NotFoundException('报备不存在');
    }
    
    if (report.status !== 1) {
      throw new BadRequestException('只能撤销待审批的报备');
    }
    
    // 验证是否是自己的报备
    if (report.memberId !== memberId) {
      throw new BadRequestException('只能撤销自己提交的报备');
    }

    return this.prisma.$transaction(async (tx) => {
      // 更新报备状态为已撤销
      await tx.report.update({
        where: { id: reportId },
        data: { status: 4 },
      });
      
      // 删除关联的收入记录
      if (report.earnings?.length) {
        await tx.earning.updateMany({
          where: { reportId },
          data: { status: 3 },
        });
      }
      
      return { success: true, message: '报备已撤销' };
    });
  }
}
