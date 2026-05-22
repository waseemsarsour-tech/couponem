import { Body, Controller, Get, Post, Res, HttpCode } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: false,
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

  @Get('me')
  me(@CurrentUser() user: { id: string; username: string }) {
    return { username: user.username };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
    return { ok: true };
  }
}
