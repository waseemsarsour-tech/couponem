import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Coupon, Purchase } from './coupon.types';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsRepository {
  private readonly coupons: Coupon[] = [];

  findAll(): Coupon[] {
    return this.coupons;
  }

  findById(id: string): Coupon | undefined {
    return this.coupons.find((c) => c.id === id);
  }

  create(dto: CreateCouponDto): Coupon {
    const coupon: Coupon = {
      id: randomUUID(),
      number: dto.number,
      company: dto.company,
      source: dto.source,
      purchaseDate: new Date(dto.purchaseDate),
      expiryDate: new Date(dto.expiryDate),
      initialAmount: dto.initialAmount,
      remainingAmount: dto.initialAmount,
      tags: dto.tags ?? [],
      purchases: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.coupons.push(coupon);
    return coupon;
  }

  update(id: string, dto: UpdateCouponDto): Coupon | undefined {
    const coupon = this.findById(id);
    if (!coupon) return undefined;

    if (dto.number !== undefined) coupon.number = dto.number;
    if (dto.company !== undefined) coupon.company = dto.company;
    if (dto.source !== undefined) coupon.source = dto.source;
    if (dto.purchaseDate !== undefined) coupon.purchaseDate = new Date(dto.purchaseDate);
    if (dto.expiryDate !== undefined) coupon.expiryDate = new Date(dto.expiryDate);
    if (dto.tags !== undefined) coupon.tags = dto.tags;
    coupon.updatedAt = new Date();

    return coupon;
  }

  addPurchase(couponId: string, data: Omit<Purchase, 'id'>): { coupon: Coupon; purchase: Purchase } | undefined {
    const coupon = this.findById(couponId);
    if (!coupon) return undefined;

    const purchase: Purchase = { id: randomUUID(), ...data };
    coupon.purchases.push(purchase);
    coupon.remainingAmount -= data.amount;
    coupon.updatedAt = new Date();

    return { coupon, purchase };
  }
}
