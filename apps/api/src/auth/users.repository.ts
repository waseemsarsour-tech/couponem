import { Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { User } from './user.types';

@Injectable()
export class UsersRepository implements OnModuleInit {
  private readonly users: User[] = [];

  async onModuleInit() {
    // Seed a default user — change these credentials before going to production
    await this.create('admin', 'admin123');
  }

  async create(username: string, password: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);
    const user: User = { id: randomUUID(), username, passwordHash };
    this.users.push(user);
    return user;
  }

  findByUsername(username: string): User | undefined {
    return this.users.find((u) => u.username === username);
  }
}
