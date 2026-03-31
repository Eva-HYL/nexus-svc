import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClubService } from './club.service';
import { CreateClubDto, UpdateClubDto } from './dto/club.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MemberRole } from '@prisma/client';

@Controller('api/club')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  /**
   * 获取我的俱乐部列表
   * GET /api/club/my-clubs
   */
  @Get('my-clubs')
  async getMyClubs(@Request() req: any) {
    const { userId } = req.user;
    return this.clubService.getMyClubs(userId);
  }

  /**
   * 创建俱乐部
   * POST /api/club/create
   */
  @Post('create')
  async create(@Request() req: any, @Body() dto: CreateClubDto) {
    const { userId } = req.user;
    return this.clubService.create(userId, dto);
  }

  /**
   * 获取俱乐部详情
   * GET /api/club/:id
   */
  @Get(':id')
  async getClub(@Param('id') id: string) {
    return this.clubService.getClubById(BigInt(id));
  }

  /**
   * 更新俱乐部信息
   * PUT /api/club/:id
   */
  @Put(':id')
  @Roles(MemberRole.ADMIN, MemberRole.OWNER)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClubDto,
  ) {
    return this.clubService.update(BigInt(id), dto);
  }

  /**
   * 转让俱乐部
   * POST /api/club/:id/transfer
   */
  @Post(':id/transfer')
  @Roles(MemberRole.OWNER)
  async transfer(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: { newOwnerId: number },
  ) {
    const { userId } = req.user;
    return this.clubService.transfer(
      BigInt(id),
      userId,
      BigInt(dto.newOwnerId),
    );
  }

  /**
   * 解散俱乐部
   * DELETE /api/club/:id
   */
  @Delete(':id')
  @Roles(MemberRole.OWNER)
  async dissolve(@Request() req: any, @Param('id') id: string) {
    const { userId } = req.user;
    return this.clubService.dissolve(BigInt(id), userId);
  }

  /**
   * 切换俱乐部
   * POST /api/club/switch
   */
  @Post('switch')
  @HttpCode(HttpStatus.OK)
  async switchClub(@Request() req: any, @Body() dto: { clubId: number }) {
    const { userId } = req.user;
    return this.clubService.switchClub(userId, BigInt(dto.clubId));
  }

  /**
   * 获取当前俱乐部
   * GET /api/club/current
   */
  @Get('current')
  async getCurrentClub(@Request() req: any) {
    const { userId, currentClubId } = req.user;
    if (!currentClubId) {
      // 获取用户的第一个俱乐部
      const clubs = await this.clubService.getMyClubs(userId);
      if (clubs.length === 0) {
        return { club: null };
      }
      return { club: clubs[0] };
    }
    return this.clubService.getClubById(currentClubId);
  }
}
