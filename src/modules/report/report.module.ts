import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ProjectModule } from '../project/project.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [ProjectModule, WalletModule],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
