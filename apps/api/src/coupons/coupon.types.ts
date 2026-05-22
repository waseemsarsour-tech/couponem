export enum CouponSource {
  LEUMI_BONUS = 'leumi-bonus',
  SHELACH = 'shelach',
  BUYME = 'buyme',
}

export type UrgencyLevel = 'red' | 'yellow' | 'blue';

export interface Purchase {
  id: string;
  amount: number;
  date: Date;
  note?: string;
}

export interface Coupon {
  id: string;
  number: string;
  company: string;
  source: CouponSource;
  purchaseDate: Date;
  expiryDate: Date;
  initialAmount: number;
  remainingAmount: number;
  tags: string[];
  purchases: Purchase[];
  createdAt: Date;
  updatedAt: Date;
}
