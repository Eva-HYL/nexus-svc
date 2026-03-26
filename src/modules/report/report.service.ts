import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportStatus, MemberStatus, MemberRole } from '@prisma/client';
import { ProjectService } from '../project/project.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private prisma: PrismaService,
    private projectService: ProjectService,
    private walletService: WalletService,
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

    // 检查是否启用自动代扣
    const clubConfig = await this.prisma.clubConfig.findUnique({
      where: { clubId },
    });

    const autoDeduct = clubConfig?.autoDeduct ?? false;
    
    // 如果启用自动代扣，检查余额
    if (autoDeduct && commission > 0) {
      const hasBalance = await this.walletService.checkBalance(clubId, memberId, commission);
      if (!hasBalance) {
        throw new BadRequestException('积分余额不足，请先充值');
      }
    }

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
          status: ReportStatus.PENDING,
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

      // 如果启用自动代扣，执行扣款
      if (autoDeduct && commission > 0) {
        try {
          await this.walletService.deduct(
            clubId,
            memberId,
            commission,
            report.id,
            'report'
          );
          this.logger.log(`报备自动代扣: report=${report.id}, commission=${commission}`);
        } catch (err) {
          this.logger.error(`报备代扣失败: ${err.message}`);
          // 代扣失败不阻塞报备创建，但记录日志
        }
      }

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
      where: { clubId, status: ReportStatus.PENDING },
      include: {
        project: { select: { name: true } },
        creator: { select: { nickname: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approve(reportId: bigint, approverId: bigint) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report || report.status !== ReportStatus.PENDING) {
      throw new BadRequestException('报备状态异常，无法审批');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.report.update({
        where: { id: reportId },
        data: { status: ReportStatus.APPROVED, approvedBy: approverId, approvedAt: new Date() },
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
    if (!report || report.status !== ReportStatus.PENDING) {
      throw new BadRequestException('报备状态异常，无法驳回');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.report.update({
        where: { id: reportId },
        data: { status: ReportStatus.REJECTED, approvedBy: approverId, remark: reason },
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
    
    if (report.status !== ReportStatus.PENDING) {
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
        data: { status: ReportStatus.CANCELLED },
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
