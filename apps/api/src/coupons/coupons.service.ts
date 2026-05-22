import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Coupon, Purchase, UrgencyLevel } from './coupon.types';
import { CouponsRepository } from './coupons.repository';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { UseCouponDto } from './dto/use-coupon.dto';

export type CouponWithUrgency = Coupon & { urgency: UrgencyLevel | null };
export type PurchaseWithCoupon = Purchase & { couponId: string; couponNumber: string; couponCompany: string };

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

function withUrgency(coupon: Coupon): CouponWithUrgency {
  const days = daysUntilExpiry(coupon.expiryDate);
  let urgency: UrgencyLevel | null = null;
  if (days >= 0 && coupon.remainingAmount > 0) {
    if (days < 30) urgency = 'red';
    else if (days <= 60) urgency = 'yellow';
    else urgency = 'blue';
  }
  return { ...coupon, urgency };
}

@Injectable()
export class CouponsService {
  constructor(private readonly repository: CouponsRepository) {}

  async getAll(userId: string): Promise<CouponWithUrgency[]> {
    return (await this.repository.findAll(userId)).map(withUrgency);
  }

  async getActive(userId: string): Promise<CouponWithUrgency[]> {
    const today = startOfDay(new Date());
    return (await this.repository.findAll(userId))
      .filter((c) => c.remainingAmount > 0 && startOfDay(c.expiryDate) >= today)
      .map(withUrgency);
  }

  async getUsed(userId: string): Promise<Coupon[]> {
    return (await this.repository.findAll(userId)).filter((c) => c.remainingAmount === 0);
  }

  async getExpired(userId: string): Promise<Coupon[]> {
    const today = startOfDay(new Date());
    return (await this.repository.findAll(userId)).filter(
      (c) => startOfDay(c.expiryDate) < today && c.remainingAmount > 0,
    );
  }

  async getAllHistory(userId: string): Promise<PurchaseWithCoupon[]> {
    return (await this.repository.findAll(userId))
      .flatMap((c) =>
        c.purchases.map((p) => ({ ...p, couponId: c.id, couponNumber: c.number, couponCompany: c.company })),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getById(id: string, userId: string): Promise<CouponWithUrgency> {
    const coupon = await this.repository.findById(id, userId);
    if (!coupon) throw new NotFoundException(`Coupon ${id} not found`);
    return withUrgency(coupon);
  }

  async getCouponHistory(id: string, userId: string): Promise<Purchase[]> {
    const coupon = await this.repository.findById(id, userId);
    if (!coupon) throw new NotFoundException(`Coupon ${id} not found`);
    return coupon.purchases;
  }

  async create(userId: string, dto: CreateCouponDto): Promise<Coupon> {
    return this.repository.create(userId, dto);
  }

  async update(id: string, userId: string, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.repository.update(id, userId, dto);
    if (!coupon) throw new NotFoundException(`Coupon ${id} not found`);
    return coupon;
  }

  async use(id: string, userId: string, dto: UseCouponDto): Promise<{ coupon: Coupon; purchase: Purchase }> {
    const coupon = await this.repository.findById(id, userId);
    if (!coupon) throw new NotFoundException(`Coupon ${id} not found`);
    if (coupon.remainingAmount < dto.amount) {
      throw new BadRequestException(
        `Insufficient balance. Remaining: ${coupon.remainingAmount}, requested: ${dto.amount}`,
      );
    }
    return (await this.repository.addPurchase(id, userId, { amount: dto.amount, date: new Date(), note: dto.note }))!;
  }
}
