import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: '手机号不能为空' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码不能少于6位' })
  @MaxLength(20, { message: '密码不能超过20位' })
  password: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: '手机号不能为空' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码不能少于6位' })
  @MaxLength(20, { message: '密码不能超过20位' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, { message: '密码必须包含字母和数字' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '昵称不能为空' })
  @MaxLength(20, { message: '昵称不能超过20位' })
  nickname: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'refreshToken不能为空' })
  refreshToken: string;
}