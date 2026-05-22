import { Injectable, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './user.types';

@Injectable()
export class UsersRepository implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const existing = await this.findByUsername('admin');
    if (!existing) {
      await this.create('admin', 'admin123');
    }
  }

  async create(username: string, password: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);
    return this.prisma.user.create({ data: { username, passwordHash } });
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    return user ?? undefined;
  }
}
