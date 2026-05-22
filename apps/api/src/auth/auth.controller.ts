import { Body, Controller, Post, Res, HttpCode } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';

const isProd = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
  secure: isProd,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.login(dto.username, dto.password);
    res.cookie('token', token, COOKIE_OPTIONS);
    return { ok: true };
  }

  @Public()
  @Post('signup')
  @HttpCode(200)
  async signup(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.signup(dto.username, dto.password);
    res.cookie('token', token, COOKIE_OPTIONS);
    return { ok: true };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
    return { ok: true };
  }
}
