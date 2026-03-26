import { Module } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { DepositController } from './deposit.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  controllers: [DepositController],
  providers: [DepositService],
  imports: [PrismaModule],
  exports: [DepositService],
})
export class DepositModule {}
