export type CouponSource = 'leumi-bonus' | 'shelach' | 'buyme';
export type UrgencyLevel = 'red' | 'yellow' | 'blue';

export interface Purchase {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Coupon {
  id: string;
  number: string;
  company: string;
  source: CouponSource;
  purchaseDate: string;
  expiryDate: string;
  initialAmount: number;
  remainingAmount: number;
  tags: string[];
  uncertain: boolean;
  purchases: Purchase[];
  urgency: UrgencyLevel | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseWithCoupon extends Purchase {
  couponId: string;
  couponNumber: string;
  couponCompany: string;
}

export interface CreateCouponInput {
  number: string;
  company: string;
  source: CouponSource;
  purchaseDate: string;
  expiryDate: string;
  initialAmount: number;
  tags?: string[];
  uncertain?: boolean;
}

export interface UpdateCouponInput {
  number?: string;
  company?: string;
  source?: CouponSource;
  purchaseDate?: string;
  expiryDate?: string;
  tags?: string[];
  uncertain?: boolean;
  remainingAmount?: number;
}

export interface UseCouponInput {
  amount: number;
  note?: string;
}
