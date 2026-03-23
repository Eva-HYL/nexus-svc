import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async findAll(clubId: bigint) {
    return this.prisma.project.findMany({
      where: { clubId, status: 1 },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: bigint) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('项目不存在');
    return project;
  }

  async create(clubId: bigint, data: {
    name: string;
    type?: number;
    price: number;
    priceType?: number;
    commissionType?: number;
    commissionValue?: number;
  }) {
    return this.prisma.project.create({ data: { clubId, ...data } });
  }

  async update(id: bigint, data: Partial<{
    name: string;
    price: number;
    commissionType: number;
    commissionValue: number;
    status: number;
  }>) {
    return this.prisma.project.update({ where: { id }, data });
  }
}
