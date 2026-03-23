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
exports.MemberService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MemberService = class MemberService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(clubId, page = 1, pageSize = 20) {
        const [list, total] = await Promise.all([
            this.prisma.clubMember.findMany({
                where: { clubId, status: { not: 3 } },
                include: { user: { select: { id: true, nickname: true, avatar: true, phone: true } } },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.clubMember.count({ where: { clubId, status: { not: 3 } } }),
        ]);
        return { list, pagination: { page, pageSize, total } };
    }
    async updateRole(clubId, userId, role) {
        const member = await this.prisma.clubMember.findUnique({
            where: { clubId_userId: { clubId, userId } },
        });
        if (!member)
            throw new common_1.NotFoundException('成员不存在');
        return this.prisma.clubMember.update({
            where: { clubId_userId: { clubId, userId } },
            data: { role },
        });
    }
    async remove(clubId, userId) {
        return this.prisma.clubMember.update({
            where: { clubId_userId: { clubId, userId } },
            data: { status: 3 },
        });
    }
    async add(clubId, userId, role = 3) {
        return this.prisma.clubMember.upsert({
            where: { clubId_userId: { clubId, userId } },
            create: { clubId, userId, role, status: 1 },
            update: { status: 1, role },
        });
    }
};
exports.MemberService = MemberService;
exports.MemberService = MemberService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MemberService);
//# sourceMappingURL=member.service.js.map