import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private connected = false;

  constructor() {
    super({
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    // 不在这里连接数据库，让请求时再连接
    this.logger.log('Prisma service initialized (lazy connection)');
  }

  async onModuleDestroy() {
    if (this.connected) {
      await this.$disconnect();
      this.logger.log('Prisma disconnected');
    }
  }

  // 确保连接
  async ensureConnection() {
    if (!this.connected) {
      try {
        await this.$connect();
        this.connected = true;
        this.logger.log('Database connected');
      } catch (error) {
        this.logger.error('Database connection failed:', error);
        throw error;
      }
    }
  }
}