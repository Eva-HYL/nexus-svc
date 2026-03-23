import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  async findById(id: bigint) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, phone: true, nickname: true, avatar: true, status: true, createdAt: true },
    });
  }

  async register(phone: string, password: string, nickname?: string) {
    const exists = await this.findByPhone(phone);
    if (exists) throw new ConflictException('手机号已注册');

    const hashed = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { phone, password: hashed, nickname },
      select: { id: true, phone: true, nickname: true, createdAt: true },
    });
  }

  async updateProfile(id: bigint, data: { nickname?: string; avatar?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, phone: true, nickname: true, avatar: true },
    });
  }
}
