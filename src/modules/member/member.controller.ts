import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MemberService } from './member.service';

@Controller('member')
@UseGuards(AuthGuard('jwt'))
export class MemberController {
  constructor(private memberService: MemberService) {}

  @Get('list')
  findAll(
    @Query('clubId') clubId: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.memberService.findAll(BigInt(clubId), +page, +pageSize);
  }

  @Post('add')
  add(@Body() body: { clubId: string; userId: string; role?: number }) {
    return this.memberService.add(BigInt(body.clubId), BigInt(body.userId), body.role);
  }

  @Put(':userId/role')
  updateRole(
    @Param('userId') userId: string,
    @Body() body: { clubId: string; role: number },
  ) {
    return this.memberService.updateRole(BigInt(body.clubId), BigInt(userId), body.role);
  }

  @Delete(':userId')
  remove(@Param('userId') userId: string, @Query('clubId') clubId: string) {
    return this.memberService.remove(BigInt(clubId), BigInt(userId));
  }
}
