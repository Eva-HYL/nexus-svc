import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/login.dto';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

class WxLoginDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

class SmsLoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

class SendSmsDto {
  @IsString()
  @IsNotEmpty({ message: '手机号不能为空' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * 用户注册
   * POST /api/auth/register
   */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * 用户登录（密码登录）
   * POST /api/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * 微信一键登录
   * POST /api/auth/wx-login
   */
  @Post('wx-login')
  @HttpCode(HttpStatus.OK)
  async wxLogin(@Body() dto: WxLoginDto) {
    return this.authService.wxLogin(dto.code);
  }

  /**
   * 验证码登录
   * POST /api/auth/sms-login
   */
  @Post('sms-login')
  @HttpCode(HttpStatus.OK)
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
}