import { Module } from '@nestjs/common';
import { GroupFeeService } from './group-fee.service';
import { GroupFeeController } from './group-fee.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  controllers: [GroupFeeController],
  providers: [GroupFeeService],
  imports: [PrismaModule],
  exports: [GroupFeeService],
})
export class GroupFeeModule {}
