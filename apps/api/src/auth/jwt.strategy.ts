import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { UsersRepository } from './users.repository';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';

function extractFromCookie(req: Request): string | null {
  return req.cookies?.token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly users: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractFromCookie]),
      secretOrKey: JWT_SECRET,
      passReqToCallback: false,
    });
  }

  validate(payload: { sub: string; username: string }) {
    const user = this.users.findByUsername(payload.username);
    if (!user) throw new UnauthorizedException();
    return { id: payload.sub, username: payload.username };
  }
}
