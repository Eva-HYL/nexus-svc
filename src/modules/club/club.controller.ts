import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClubService } from './club.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('club')
@UseGuards(AuthGuard('jwt'))
export class ClubController {
  constructor(private clubService: ClubService) {}

  @Post('create')
  create(@CurrentUser('id') userId: string, @Body() body: { name: string; logo?: string; description?: string }) {
    return this.clubService.create(BigInt(userId), body);
  }

  @Get('list')
  myClubs(@CurrentUser('id') userId: string) {
    return this.clubService.findByUser(BigInt(userId));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubService.findById(BigInt(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.clubService.update(BigInt(id), body);
  }
}
