import { Injectable, Logger } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 导出报备数据
   */
  async exportReports(clubId: bigint, query: {
    startDate?: Date;
    endDate?: Date;
    status?: number;
  }) {
    const where: any = { clubId };
    if (query.status) where.status = query.status;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = query.startDate;
      if (query.endDate) where.createdAt.lte = query.endDate;
    }

    const reports = await this.prisma.report.findMany({
      where,
      include: {
        project: { select: { name: true } },
        creator: { select: { nickname: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('报备数据');

    // 设置表头
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 15 },
      { header: '提交时间', key: 'createdAt', width: 20 },
      { header: '项目名称', key: 'projectName', width: 15 },
      { header: '老板名称', key: 'bossName', width: 15 },
      { header: '时长(分钟)', key: 'duration', width: 12 },
      { header: '数量', key: 'quantity', width: 10 },
      { header: '金额', key: 'amount', width: 12 },
      { header: '抽成', key: 'commission', width: 10 },
      { header: '实际金额', key: 'actualAmount', width: 12 },
      { header: '提交人', key: 'creatorName', width: 15 },
      { header: '状态', key: 'statusText', width: 10 },
      { header: '备注', key: 'remark', width: 30 },
    ];

    // 添加数据行
    const statusMap = { 1: '待审批', 2: '已通过', 3: '已驳回', 4: '已撤销' };
    reports.forEach((report) => {
      worksheet.addRow({
        id: report.id.toString(),
        createdAt: report.createdAt.toLocaleString('zh-CN'),
        projectName: report.project.name,
        bossName: report.bossName,
        duration: report.duration ?? '-',
        quantity: report.quantity ?? '-',
        amount: Number(report.amount).toFixed(2),
        commission: Number(report.commission).toFixed(2),
        actualAmount: Number(report.actualAmount).toFixed(2),
        creatorName: report.creator.nickname || report.creator.phone,
        statusText: statusMap[report.status] || '未知',
        remark: report.remark || '-',
      });
    });

    // 设置表头样式
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    this.logger.log(`导出报备数据: club=${clubId}, count=${reports.length}`);
    return workbook;
  }

  /**
   * 导出积分流水
   */
  async exportWalletTransactions(clubId: bigint, query: {
    userId?: bigint;
    type?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const wallets = await this.prisma.wallet.findMany({
      where: { clubId },
      select: { id: true, userId: true },
    });

    const walletIds = wallets.map(w => w.id);
    const userIdMap = new Map(wallets.map(w => [w.id, w.userId]));

    const where: any = { walletId: { in: walletIds } };
    if (query.type) where.type = query.type;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = query.startDate;
      if (query.endDate) where.createdAt.lte = query.endDate;
    }

    const transactions = await this.prisma.walletTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // 获取用户信息
    const userIds = [...new Set(transactions.map(t => userIdMap.get(t.walletId)).filter(Boolean))] as bigint[];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, nickname: true, phone: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('积分流水');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 15 },
      { header: '交易时间', key: 'createdAt', width: 20 },
      { header: '用户', key: 'userName', width: 15 },
      { header: '交易类型', key: 'typeText', width: 12 },
      { header: '金额', key: 'amount', width: 12 },
      { header: '余额', key: 'balance', width: 12 },
      { header: '状态', key: 'statusText', width: 10 },
      { header: '备注', key: 'remark', width: 30 },
    ];

    const typeMap = { 1: '充值', 2: '代扣', 3: '退款', 4: '提现', 5: '调账+', 6: '调账-' };
    const statusMap = { 1: '成功', 2: '失败', 3: '处理中' };

    transactions.forEach((t) => {
      const userId = userIdMap.get(t.walletId);
      const user = userId ? userMap.get(userId) : undefined;
      worksheet.addRow({
        id: t.id.toString(),
        createdAt: t.createdAt.toLocaleString('zh-CN'),
        userName: user?.nickname || user?.phone || '-',
        typeText: typeMap[t.type] || '未知',
        amount: Number(t.amount).toFixed(2),
        balance: Number(t.balance).toFixed(2),
        statusText: statusMap[t.status] || '未知',
        remark: t.remark || '-',
      });
    });

    worksheet.getRow(1).font = { bold: true };

    this.logger.log(`导出积分流水: club=${clubId}, count=${transactions.length}`);
    return workbook;
  }

  /**
   * 导出工资台账
   */
  async exportSalaries(clubId: bigint) {
    const salaries = await this.prisma.salary.findMany({
      where: { clubId },
      include: {
        earnings: {
          include: {
            report: {
              include: { project: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('工资台账');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 15 },
      { header: '周期开始', key: 'periodStart', width: 12 },
      { header: '周期结束', key: 'periodEnd', width: 12 },
      { header: '总金额', key: 'totalAmount', width: 12 },
      { header: '总抽成', key: 'totalCommission', width: 10 },
      { header: '实发金额', key: 'actualAmount', width: 12 },
      { header: '状态', key: 'statusText', width: 10 },
      { header: '发放时间', key: 'paidAt', width: 20 },
    ];

    const statusMap = { 1: '待发放', 2: '发放中', 3: '已发放' };

    salaries.forEach((s) => {
      worksheet.addRow({
        id: s.id.toString(),
        periodStart: s.periodStart.toLocaleDateString('zh-CN'),
        periodEnd: s.periodEnd.toLocaleDateString('zh-CN'),
        totalAmount: Number(s.totalAmount).toFixed(2),
        totalCommission: Number(s.totalCommission).toFixed(2),
        actualAmount: Number(s.actualAmount).toFixed(2),
        statusText: statusMap[s.status] || '未知',
        paidAt: s.paidAt?.toLocaleString('zh-CN') || '-',
      });
    });

    worksheet.getRow(1).font = { bold: true };

    this.logger.log(`导出工资台账: club=${clubId}, count=${salaries.length}`);
    return workbook;
  }
}