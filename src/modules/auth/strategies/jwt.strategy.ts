import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'elva-secret',
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      phone: payload.phone,
      clubId: payload.clubId,
      role: payload.role,
    };
  }
}
