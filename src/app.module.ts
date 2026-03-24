import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ClubModule } from './modules/club/club.module';
import { MemberModule } from './modules/member/member.module';
import { ProjectModule } from './modules/project/project.module';
import { ReportModule } from './modules/report/report.module';
import { FinanceModule } from './modules/finance/finance.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { ExportModule } from './modules/export/export.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UserModule,
    ClubModule,
    MemberModule,
    ProjectModule,
    ReportModule,
    FinanceModule,
    WalletModule,
    ExportModule,
  ],
})
export class AppModule {}