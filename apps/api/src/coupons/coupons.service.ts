import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Coupon, Purchase, UrgencyLevel } from './coupon.types';
import { CouponsRepository } from './coupons.repository';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { UseCouponDto } from './dto/use-coupon.dto';

export type CouponWithUrgency = Coupon & { urgency: UrgencyLevel | null };

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysUntilExpiry(expiryDate: Date): number {
  const today = startOfDay(new Date());
  const expiry = startOfDay(expiryDate);
  return Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
export type PurchaseWithCoupon = Purchase & { couponId: string; couponNumber: string; couponCompany: string };

@Injectable()
export class CouponsService {
  constructor(private readonly repository: CouponsRepository) {}

  getAll(): CouponWithUrgency[] {
    return this.repository.findAll().map(this.withUrgency);
  }

  getActive(): CouponWithUrgency[] {
    const today = startOfDay(new Date());
    return this.repository
      .findAll()
      .filter((c) => c.remainingAmount > 0 && startOfDay(c.expiryDate) >= today)
      .map(this.withUrgency);
  }

  getUsed(): Coupon[] {
    return this.repository.findAll().filter((c) => c.remainingAmount === 0);
  }

  getExpired(): Coupon[] {
    const today = startOfDay(new Date());
    return this.repository.findAll().filter((c) => startOfDay(c.expiryDate) < today && c.remainingAmount > 0);
  }

  getAllHistory(): PurchaseWithCoupon[] {
    return this.repository
      .findAll()
      .flatMap((c) => c.purchases.map((p) => ({ ...p, couponId: c.id, couponNumber: c.number, couponCompany: c.company })))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getById(id: string): CouponWithUrgency {
    const coupon = this.repository.findById(id);
    if (!coupon) throw new NotFoundException(`Coupon ${id} not found`);
    return this.withUrgency(coupon);
  }

  getCouponHistory(id: string): Purchase[] {
    const coupon = this.repository.findById(id);
    if (!coupon) throw new NotFoundException(`Coupon ${id} not found`);
    return coupon.purchases;
  }

  create(dto: CreateCouponDto): Coupon {
    return this.repository.create(dto);
  }

  update(id: string, dto: UpdateCouponDto): Coupon {
    const coupon = this.repository.update(id, dto);
    if (!coupon) throw new NotFoundException(`Coupon ${id} not found`);
    return coupon;
  }

  use(id: string, dto: UseCouponDto): { coupon: Coupon; purchase: Purchase } {
    const coupon = this.repository.findById(id);
    if (!coupon) throw new NotFoundException(`Coupon ${id} not found`);
    if (coupon.remainingAmount < dto.amount) {
      throw new BadRequestException(
        `Insufficient balance. Remaining: ${coupon.remainingAmount}, requested: ${dto.amount}`,
      );
    }

    return this.repository.addPurchase(id, { amount: dto.amount, date: new Date(), note: dto.note })!;
  }

  private withUrgency(coupon: Coupon): CouponWithUrgency {
    const days = daysUntilExpiry(coupon.expiryDate);
    let urgency: UrgencyLevel | null = null;
    if (days >= 0 && coupon.remainingAmount > 0) {
      if (days < 30) urgency = 'red';
      else if (days <= 60) urgency = 'yellow';
      else urgency = 'blue';
    }
    return { ...coupon, urgency };
  }
}
