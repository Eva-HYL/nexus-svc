import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClubConfigService } from './club-config.service';
import { UpdateClubConfigDto } from './dto/update-club-config.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MemberRole } from '@prisma/client';

@Controller('api/club/config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClubConfigController {
  constructor(private readonly clubConfigService: ClubConfigService) {}

  /**
   * 获取俱乐部配置
   * GET /api/club/config
   */
  @Get()
  @Roles(MemberRole.ADMIN, MemberRole.OWNER)
  async getConfig(@Request() req: any) {
    const { clubId } = req.user;
    return this.clubConfigService.getConfig(clubId);
  }

  /**
   * 更新俱乐部配置
   * POST /api/club/config
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @Roles(MemberRole.ADMIN, MemberRole.OWNER)
  async updateConfig(
    @Request() req: any,
    @Body() dto: UpdateClubConfigDto,
  ) {
    const { clubId } = req.user;
    return this.clubConfigService.updateConfig(clubId, dto);
  }

  /**
   * 更新积分代扣开关
   * POST /api/club/config/auto-deduct
   */
  @Post('auto-deduct')
  @HttpCode(HttpStatus.OK)
  @Roles(MemberRole.ADMIN, MemberRole.OWNER)
  async updateAutoDeduct(
    @Request() req: any,
    @Body() dto: { enabled: boolean; minBalance?: number },
  ) {
    const { clubId } = req.user;
    return this.clubConfigService.updateAutoDeduct(
      clubId,
      dto.enabled,
      dto.minBalance,
    );
  }

  /**
   * 更新审批模式
   * POST /api/club/config/approval-mode
   */
  @Post('approval-mode')
  @HttpCode(HttpStatus.OK)
  @Roles(MemberRole.ADMIN, MemberRole.OWNER)
  async updateApprovalMode(
    @Request() req: any,
    @Body() dto: { mode: number },
  ) {
    const { clubId } = req.user;
    return this.clubConfigService.updateApprovalMode(clubId, dto.mode);
  }
}
