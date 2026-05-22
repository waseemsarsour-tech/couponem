import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { UsersRepository } from './users.repository';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({ secret: JWT_SECRET, signOptions: { expiresIn: '7d' } }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, UsersRepository],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
