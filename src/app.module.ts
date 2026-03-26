import { Module, Controller, Get } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// 数据库模块
import { PrismaModule } from './prisma/prisma.module';

// 业务模块
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ClubModule } from './modules/club/club.module';
import { MemberModule } from './modules/member/member.module';
import { ProjectModule } from './modules/project/project.module';
import { ReportModule } from './modules/report/report.module';
import { FinanceModule } from './modules/finance/finance.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { ExportModule } from './modules/export/export.module';
import { NoticeModule } from './modules/notice/notice.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { FineModule } from './modules/fine/fine.module';
import { GroupFeeModule } from './modules/group-fee/group-fee.module';
import { DepositModule } from './modules/deposit/deposit.module';

@Controller()
class RootController {
  @Get()
  index() {
    return { name: 'nexus-server', version: '1.0.0', status: 'running' };
  }

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    ClubModule,
    MemberModule,
    ProjectModule,
    ReportModule,
    FinanceModule,
    WalletModule,
    ExportModule,
    NoticeModule,
    RankingModule,
    FineModule,
    GroupFeeModule,
    DepositModule,
  ],
  controllers: [RootController],
})
export class AppModule {}