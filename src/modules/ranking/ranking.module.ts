import { Module } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { RankingController } from './ranking.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  controllers: [RankingController],
  providers: [RankingService],
  imports: [PrismaModule],
  exports: [RankingService],
})
export class RankingModule {}
