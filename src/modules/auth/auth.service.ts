import { Injectable, UnauthorizedException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/login.dto';
import { UserStatus } from '../../common/constants';

interface JwtPayload {
  sub: string;
  phone: string;
}

// 密码加密配置
const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * 用户注册
   */
  async register(dto: RegisterDto) {
    // 验证密码强度
    const passwordCheck = this.validatePassword(dto.password);
    if (!passwordCheck.valid) {
      throw new BadRequestException(passwordCheck.message);
    }

    // 检查手机号是否已注册
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existingUser) {
      throw new ConflictException('该手机号已注册');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        password: hashedPassword,
        nickname: dto.nickname,
        status: UserStatus.ACTIVE,
      },
    });

    this.logger.log(`用户注册成功: ${user.id}`);

    return this.generateTokenResponse(user);
  }

  /**
   * 用户登录
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('账号已被禁用');
    }

    this.logger.log(`用户登录成功: ${user.id}`);
    return this.generateTokenResponse(user);
  }

  /**
   * 微信一键登录
   * 通过 code 换取 openid，查找或创建用户
   */
  async wxLogin(code: string) {
    // 调用微信 API 获取 openid 和 session_key
    const wxResult = await this.getWxOpenId(code);
    
    if (!wxResult.openid) {
      throw new UnauthorizedException('微信登录失败，请重试');
    }

    // 查找是否已有用户绑定此 openid
    let user = await this.prisma.user.findFirst({
      where: { 
        OR: [
          { phone: `wx_${wxResult.openid}` },  // 微信用户用特殊手机号标识
        ]
      },
    });

    // 如果用户不存在，创建新用户
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: `wx_${wxResult.openid}`,
          password: await bcrypt.hash(Math.random().toString(36), SALT_ROUNDS),
          nickname: `微信用户${wxResult.openid.slice(-6)}`,
          status: UserStatus.ACTIVE,
        },
      });
      this.logger.log(`微信新用户注册: ${user.id}, openid: ${wxResult.openid}`);
    }

    return this.generateTokenResponse(user);
  }

  /**
   * 调用微信 API 获取 openid
   */
  private async getWxOpenId(code: string): Promise<{ openid: string; session_key: string }> {
    const appid = process.env.WECHAT_APPID;
    const secret = process.env.WECHAT_SECRET;

    // 如果没有配置微信信息，使用模拟模式（开发环境）
    if (!appid || !secret) {
      this.logger.warn('微信配置缺失，使用模拟登录模式');
      return {
        openid: `mock_openid_${Date.now()}`,
        session_key: 'mock_session_key',
      };
    }

    // 调用微信接口
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
    
    try {
      const response = await fetch(url);
      const data = await response.json() as any;
      
      if (data.errcode) {
        this.logger.error(`微信登录失败: ${data.errmsg}`);
        throw new UnauthorizedException('微信登录失败');
      }

      return {
        openid: data.openid,
        session_key: data.session_key,
      };
    } catch (err) {
      this.logger.error(`微信 API 调用失败: ${err}`);
      throw new UnauthorizedException('微信登录失败，请重试');
    }
  }

  /**
   * 生成 Token 响应
   */
  private generateTokenResponse(user: any) {
    const payload: JwtPayload = { sub: user.id.toString(), phone: user.phone };
    
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
      user: {
        id: user.id.toString(),
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    };
  }

  /**
   * 刷新 Token
   */
  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const newPayload: JwtPayload = { sub: payload.sub, phone: payload.phone };
      return {
        accessToken: this.jwtService.sign(newPayload),
      };
    } catch {
      throw new UnauthorizedException('Token 已过期，请重新登录');
    }
  }

  /**
   * 验证用户密码强度
   */
  validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 6) {
      return { valid: false, message: '密码长度不能少于6位' };
    }
    if (password.length > 20) {
      return { valid: false, message: '密码长度不能超过20位' };
    }
    if (!/[a-zA-Z]/.test(password)) {
      return { valid: false, message: '密码必须包含字母' };
    }
    if (!/\d/.test(password)) {
      return { valid: false, message: '密码必须包含数字' };
    }
    return { valid: true };
  }
}