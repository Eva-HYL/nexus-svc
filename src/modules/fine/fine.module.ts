import { Module } from '@nestjs/common';
import { FineService } from './fine.service';
import { FineController } from './fine.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  controllers: [FineController],
  providers: [FineService],
  imports: [PrismaModule],
  exports: [FineService],
})
export class FineModule {}
