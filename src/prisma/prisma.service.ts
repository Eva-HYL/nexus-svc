import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['error', 'warn'],
      // 不在构造函数中连接
    });
    this.logger.log('PrismaService created');
  }

  async onModuleInit() {
    // 不在这里连接，延迟到第一次查询时
    this.logger.log('PrismaService initialized (lazy connection)');
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Prisma disconnected');
    } catch (error) {
      this.logger.error('Disconnect error:', error);
    }
  }
}