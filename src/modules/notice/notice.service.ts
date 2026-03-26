import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NoticeType } from '@prisma/client';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/create-notice.dto';

@Injectable()
export class NoticeService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取公告列表
   */
  async findAll(clubId: bigint, page: number, pageSize: number) {
    const [list, total] = await Promise.all([
      this.prisma.clubNotice.findMany({
        where: { clubId, status: 1, deletedAt: null },
        orderBy: [{ isTop: 'desc' }, { publishAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.clubNotice.count({ where: { clubId, status: 1, deletedAt: null } }),
    ]);

    return {
      list: list.map((n) => ({
        ...n,
        type: n.type.toString(),
      })),
      pagination: { page, pageSize, total },
    };
  }

  /**
   * 获取公告详情
   */
  async findById(id: bigint) {
    const notice = await this.prisma.clubNotice.findUnique({
      where: { id, deletedAt: null },
    });

    if (!notice) {
      throw new NotFoundException('公告不存在');
    }

    return notice;
  }

  /**
   * 创建公告
   */
  async create(clubId: bigint, publisherId: bigint, dto: CreateNoticeDto) {
    const typeMap: Record<number, NoticeType> = {
      1: NoticeType.NORMAL,
      2: NoticeType.IMPORTANT,
      3: NoticeType.URGENT,
    };

    return this.prisma.clubNotice.create({
      data: {
        clubId,
        publisher: publisherId,
        title: dto.title,
        content: dto.content,
        type: typeMap[dto.type || 1],
        isTop: dto.isTop || false,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  /**
   * 更新公告
   */
  async update(id: bigint, dto: UpdateNoticeDto) {
    await this.findById(id);

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.isTop !== undefined) updateData.isTop = dto.isTop;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.expiresAt !== undefined) updateData.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;

    return this.prisma.clubNotice.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * 删除公告（软删除）
   */
  async remove(id: bigint) {
    await this.findById(id);

    return this.prisma.clubNotice.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
