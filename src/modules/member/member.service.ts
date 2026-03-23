import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

  async findAll(clubId: bigint, page = 1, pageSize = 20) {
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

  async updateRole(clubId: bigint, userId: bigint, role: number) {
    const member = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });
    if (!member) throw new NotFoundException('成员不存在');
    return this.prisma.clubMember.update({
      where: { clubId_userId: { clubId, userId } },
      data: { role },
    });
  }

  async remove(clubId: bigint, userId: bigint) {
    return this.prisma.clubMember.update({
      where: { clubId_userId: { clubId, userId } },
      data: { status: 3 },
    });
  }

  async add(clubId: bigint, userId: bigint, role = 3) {
    return this.prisma.clubMember.upsert({
      where: { clubId_userId: { clubId, userId } },
      create: { clubId, userId, role, status: 1 },
      update: { status: 1, role },
    });
  }
}
