import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_secret', // Assure-toi que JWT_SECRET existe bien dans ton .env
    });
  }

  async validate(payload: any) {
    return {
      id: parseInt(payload.sub, 10), // ✅ Conversion explicite en nombre
      email: payload.email,
      role: payload.role,
    };
  }
}
