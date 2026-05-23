import { CouponSource } from '../coupon.types';

export class UpdateCouponDto {
  number?: string;
  company?: string;
  source?: CouponSource;
  purchaseDate?: string;
  expiryDate?: string;
  cvv?: string;
  tags?: string[];
  uncertain?: boolean;
  remainingAmount?: number;
}
