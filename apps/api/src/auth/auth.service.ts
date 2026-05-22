import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly jwt: JwtService,
  ) {}

  async login(username: string, password: string): Promise<string> {
    const user = await this.users.findByUsername(username);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.jwt.sign({ sub: user.id, username: user.username });
  }

  async signup(username: string, password: string): Promise<string> {
    const existing = await this.users.findByUsername(username);
    if (existing) throw new BadRequestException('Username already taken');

    const user = await this.users.create(username, password);
    return this.jwt.sign({ sub: user.id, username: user.username });
  }
}
