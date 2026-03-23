"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let FinanceService = class FinanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats(memberId, clubId, period) {
        const where = { memberId, clubId, type: 1 };
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
    async getEarningList(memberId, clubId, page = 1, pageSize = 20) {
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
    async calculateSalary(memberId, clubId, periodStart, periodEnd) {
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
            throw new common_1.BadRequestException('该周期内无待发放收入');
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
    async paySalary(salaryId, payerId) {
        const salary = await this.prisma.salary.findUnique({ where: { id: salaryId } });
        if (!salary || salary.status !== 1) {
            throw new common_1.BadRequestException('工资单状态异常');
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
    async getSalaryList(clubId, memberId, page = 1, pageSize = 20) {
        const where = { clubId };
        if (memberId)
            where.memberId = memberId;
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
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map