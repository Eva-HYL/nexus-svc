import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportStatus } from '@prisma/client';

export enum ApprovalAction {
  APPROVE = 1,
  REJECT = 2,
}

@Injectable()
export class ReportApprovalService {
  constructor(private prisma: PrismaService) {}

  /**
   * 审批通过（支持多级审批）
   */
  async approve(reportId: bigint, approverId: bigint, clubId: bigint) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId, clubId },
    });

    if (!report) {
      throw new NotFoundException('报备不存在');
    }

    if (report.status !== ReportStatus.PENDING) {
      throw new BadRequestException('报备状态异常，无法审批');
    }

    // 获取俱乐部配置
    const config = await this.prisma.clubConfig.findUnique({
      where: { clubId },
    });

    const approvalMode = config?.approvalMode || 1;

    // 模式 1: 仅通知，无需审批
    if (approvalMode === 1) {
      return this.autoApprove(reportId, approverId);
    }

    // 模式 2: 所属人审批
    if (approvalMode === 2) {
      if (report.ownerId !== approverId) {
        throw new ForbiddenException('无审批权限');
      }
      return this.finalApprove(reportId, approverId);
    }

    // 模式 3: 管理员审批
    if (approvalMode === 3) {
      const member = await this.prisma.clubMember.findUnique({
        where: { clubId_userId: { clubId, userId: approverId } },
      });
      if (member?.role !== 2) {
        throw new ForbiddenException('无审批权限');
      }
      return this.finalApprove(reportId, approverId);
    }

    // 模式 4: 双签（所属人 + 管理员）
    if (approvalMode === 4) {
      return this.dualSignApprove(reportId, approverId, clubId);
    }

    throw new BadRequestException('未知的审批模式');
  }

  /**
   * 自动审批（模式 1）
   */
  private async autoApprove(reportId: bigint, approverId: bigint) {
    return this.prisma.$transaction(async (tx) => {
      await tx.report.update({
        where: { id: reportId },
        data: { 
          status: ReportStatus.APPROVED, 
          approvedBy: approverId, 
          approvedAt: new Date(),
          approvalStep: 0,
        },
      });

      await tx.earning.updateMany({
        where: { reportId },
        data: { status: 1 },
      });

      return { success: true, message: '自动审批通过' };
    });
  }

  /**
   * 最终审批（模式 2、3）
   */
  private async finalApprove(reportId: bigint, approverId: bigint) {
    return this.prisma.$transaction(async (tx) => {
      await tx.report.update({
        where: { id: reportId },
        data: { 
          status: ReportStatus.APPROVED, 
          approvedBy: approverId, 
          approvedAt: new Date(),
          approvalStep: 1,
        },
      });

      await tx.earning.updateMany({
        where: { reportId },
        data: { status: 1 },
      });

      return { success: true, message: '审批通过' };
    });
  }

  /**
   * 双签审批（模式 4）
   */
  private async dualSignApprove(reportId: bigint, approverId: bigint, clubId: bigint) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('报备不存在');
    }

    // 检查当前审批人身份
    const member = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: approverId } },
    });

    if (!member) {
      throw new ForbiddenException('无审批权限');
    }

    return this.prisma.$transaction(async (tx) => {
      let nextStep = report.approvalStep;

      // 第一步：所属人审批
      if (report.ownerId === approverId && report.approvalStep === 0) {
        nextStep = 1;
      }
      // 第二步：管理员审批
      else if (member.role === 2 && report.approvalStep === 1) {
        nextStep = 2;
      } else {
        throw new ForbiddenException('当前不是您的审批环节');
      }

      // 如果已完成双签
      if (nextStep === 2) {
        await tx.report.update({
          where: { id: reportId },
          data: { 
            status: ReportStatus.APPROVED, 
            approvedBy: approverId, 
            approvedAt: new Date(),
            approvalStep: 2,
          },
        });

        await tx.earning.updateMany({
          where: { reportId },
          data: { status: 1 },
        });

        return { success: true, message: '双签完成，审批通过' };
      }

      // 更新审批步骤
      await tx.report.update({
        where: { id: reportId },
        data: { approvalStep: nextStep },
      });

      return { success: true, message: '已审批，等待下一环节审批' };
    });
  }

  /**
   * 审批驳回
   */
  async reject(reportId: bigint, approverId: bigint, clubId: bigint, reason?: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId, clubId },
    });

    if (!report) {
      throw new NotFoundException('报备不存在');
    }

    if (report.status !== ReportStatus.PENDING) {
      throw new BadRequestException('报备状态异常，无法驳回');
    }

    // 验证审批权限（简化：所有模式都允许审批人驳回）
    const config = await this.prisma.clubConfig.findUnique({
      where: { clubId },
    });

    const approvalMode = config?.approvalMode || 1;

    if (approvalMode === 2 && report.ownerId !== approverId) {
      throw new ForbiddenException('无审批权限');
    }

    if (approvalMode === 3) {
      const member = await this.prisma.clubMember.findUnique({
        where: { clubId_userId: { clubId, userId: approverId } },
      });
      if (member?.role !== 2) {
        throw new ForbiddenException('无审批权限');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.report.update({
        where: { id: reportId },
        data: { 
          status: ReportStatus.REJECTED, 
          approvedBy: approverId, 
          approvedAt: new Date(),
          remark: reason || '驳回',
        },
      });

      await tx.earning.updateMany({
        where: { reportId },
        data: { status: 3 },
      });

      return { success: true, message: '已驳回' };
    });
  }
}
