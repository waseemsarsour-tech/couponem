import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CouponsController } from './coupons.controller';
import { CouponsRepository } from './coupons.repository';
import { CouponsService } from './coupons.service';

@Module({
  imports: [PrismaModule],
  controllers: [CouponsController],
  providers: [CouponsService, CouponsRepository],
})
export class CouponsModule {}
