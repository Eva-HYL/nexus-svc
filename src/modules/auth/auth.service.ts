import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
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

    // 自动登录，返回 token
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