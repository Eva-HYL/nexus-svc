import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClubService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: bigint, data: { name: string; logo?: string; description?: string }) {
    const club = await this.prisma.club.create({
      data: { ...data, ownerId },
    });
    // 创建者自动成为创始人成员
    await this.prisma.clubMember.create({
      data: { clubId: club.id, userId: ownerId, role: 1, status: 1 },
    });
    return club;
  }

  async findById(id: bigint) {
    const club = await this.prisma.club.findUnique({ where: { id } });
    if (!club) throw new NotFoundException('俱乐部不存在');
    return club;
  }

  async findByUser(userId: bigint) {
    return this.prisma.clubMember.findMany({
      where: { userId, status: 1 },
      include: { club: true },
    });
  }

  async update(id: bigint, data: Partial<{ name: string; logo: string; description: string }>) {
    return this.prisma.club.update({ where: { id }, data });
  }
}
