import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  register(@Body() body: { phone: string; password: string; nickname?: string }) {
    return this.userService.register(body.phone, body.password, body.nickname);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@CurrentUser('id') userId: string) {
    return this.userService.findById(BigInt(userId));
  }

  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() body: { nickname?: string; avatar?: string },
  ) {
    return this.userService.updateProfile(BigInt(userId), body);
  }
}
