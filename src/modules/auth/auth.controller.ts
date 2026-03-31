import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, SmsLoginDto, SendSmsDto, RefreshTokenDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MemberRole } from '@prisma/client';

@Controller('api/auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户注册
   * POST /api/auth/register
   */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * 用户登录
   * POST /api/auth/login
   */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * 微信一键登录
   * POST /api/auth/wx-login
   */
  @Post('wx-login')
  async wxLogin(@Body() dto: { code: string }) {
    return this.authService.wxLogin(dto.code);
  }

  /**
   * 短信登录
   * POST /api/auth/sms-login
   */
  @Post('sms-login')
  async smsLogin(@Body() dto: SmsLoginDto) {
    return this.authService.loginBySms(dto.phone, dto.code);
  }

  /**
   * 发送验证码
   * POST /api/auth/send-sms
   */
  @Post('send-sms')
  @HttpCode(HttpStatus.OK)
  async sendSms(@Body() dto: SendSmsDto) {
    return this.authService.sendSmsCode(dto.phone);
  }

  /**
   * 刷新 Token
   * POST /api/auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  /**
   * 获取当前用户信息
   * GET /api/auth/me
   */
  @Get('me')
  async getMe(@Request() req: any) {
    return this.authService.getMe(req.user);
  }

  /**
   * 退出登录
   * POST /api/auth/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any) {
    // 前端清除 token 即可，后端可以记录日志或加入黑名单
    return { success: true, message: '退出成功' };
  }
}
