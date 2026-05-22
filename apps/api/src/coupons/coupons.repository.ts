import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { Coupon, Purchase } from './coupon.types';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

type CouponWithPurchases = Prisma.CouponGetPayload<{ include: { purchases: true } }>;

function toDomain(row: CouponWithPurchases): Coupon {
  return {
    id: row.id,
    number: row.number,
    company: row.company,
    source: row.source as Coupon['source'],
    purchaseDate: row.purchaseDate,
    expiryDate: row.expiryDate,
    initialAmount: row.initialAmount,
    remainingAmount: row.remainingAmount,
    tags: row.tags,
    purchases: row.purchases.map((p) => ({
      id: p.id,
      amount: p.amount,
      date: p.date,
      note: p.note ?? undefined,
    })),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const include = { purchases: true } as const;

@Injectable()
export class CouponsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<Coupon[]> {
    const rows = await this.prisma.coupon.findMany({
      where: { userId },
      include,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toDomain);
  }

  async findById(id: string, userId: string): Promise<Coupon | undefined> {
    const row = await this.prisma.coupon.findFirst({ where: { id, userId }, include });
    return row ? toDomain(row) : undefined;
  }

  async create(userId: string, dto: CreateCouponDto): Promise<Coupon> {
    const row = await this.prisma.coupon.create({
      data: {
        userId,
        number: dto.number,
        company: dto.company,
        source: dto.source,
        purchaseDate: new Date(dto.purchaseDate),
        expiryDate: new Date(dto.expiryDate),
        initialAmount: dto.initialAmount,
        remainingAmount: dto.initialAmount,
        tags: dto.tags ?? [],
      },
      include,
    });
    return toDomain(row);
  }

  async update(id: string, userId: string, dto: UpdateCouponDto): Promise<Coupon | undefined> {
    try {
      const row = await this.prisma.coupon.update({
        where: { id, userId },
        data: {
          ...(dto.number !== undefined && { number: dto.number }),
          ...(dto.company !== undefined && { company: dto.company }),
          ...(dto.source !== undefined && { source: dto.source }),
          ...(dto.purchaseDate !== undefined && { purchaseDate: new Date(dto.purchaseDate) }),
          ...(dto.expiryDate !== undefined && { expiryDate: new Date(dto.expiryDate) }),
          ...(dto.tags !== undefined && { tags: dto.tags }),
        },
        include,
      });
      return toDomain(row);
    } catch {
      return undefined;
    }
  }

  async addPurchase(
    couponId: string,
    userId: string,
    data: Omit<Purchase, 'id'>,
  ): Promise<{ coupon: Coupon; purchase: Purchase } | undefined> {
    const existing = await this.findById(couponId, userId);
    if (!existing) return undefined;

    try {
      const [purchase, coupon] = await this.prisma.$transaction([
        this.prisma.purchase.create({
          data: { couponId, amount: data.amount, date: data.date, note: data.note },
        }),
        this.prisma.coupon.update({
          where: { id: couponId },
          data: { remainingAmount: { decrement: data.amount } },
          include,
        }),
      ]);
      return {
        coupon: toDomain(coupon as CouponWithPurchases),
        purchase: { id: purchase.id, amount: purchase.amount, date: purchase.date, note: purchase.note ?? undefined },
      };
    } catch {
      return undefined;
    }
  }
}
