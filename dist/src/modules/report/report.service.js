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
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const project_service_1 = require("../project/project.service");
let ReportService = class ReportService {
    prisma;
    projectService;
    constructor(prisma, projectService) {
        this.prisma = prisma;
        this.projectService = projectService;
    }
    async submit(memberId, clubId, dto) {
        const project = await this.projectService.findById(BigInt(dto.projectId));
        const baseAmount = dto.duration
            ? Number(project.price) * (dto.duration / 60)
            : Number(project.price) * (dto.quantity || 1);
        const commission = project.commissionType === 1
            ? Number(project.commissionValue)
            : baseAmount * (Number(project.commissionValue) / 100);
        const actualAmount = baseAmount - commission;
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
    async findAll(clubId, query) {
        const { memberId, status, page = 1, pageSize = 20 } = query;
        const where = { clubId };
        if (memberId)
            where.memberId = BigInt(memberId);
        if (status)
            where.status = status;
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
    async findPending(clubId) {
        return this.prisma.report.findMany({
            where: { clubId, status: 1 },
            include: {
                project: { select: { name: true } },
                creator: { select: { nickname: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async approve(reportId, approverId) {
        const report = await this.prisma.report.findUnique({ where: { id: reportId } });
        if (!report || report.status !== 1) {
            throw new common_1.BadRequestException('报备状态异常，无法审批');
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
    async reject(reportId, approverId, reason) {
        const report = await this.prisma.report.findUnique({ where: { id: reportId } });
        if (!report || report.status !== 1) {
            throw new common_1.BadRequestException('报备状态异常，无法驳回');
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
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        project_service_1.ProjectService])
], ReportService);
//# sourceMappingURL=report.service.js.map