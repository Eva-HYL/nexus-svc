import { Module } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { NoticeController } from './notice.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  controllers: [NoticeController],
  providers: [NoticeService],
  imports: [PrismaModule],
  exports: [NoticeService],
})
export class NoticeModule {}
