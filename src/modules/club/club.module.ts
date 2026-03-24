import { Module } from '@nestjs/common';
import { ClubController } from './club.controller';
import { ClubService } from './club.service';
import { ClubConfigService } from './club-config.service';

@Module({
  controllers: [ClubController],
  providers: [ClubService, ClubConfigService],
  exports: [ClubService, ClubConfigService],
})
export class ClubModule {}
