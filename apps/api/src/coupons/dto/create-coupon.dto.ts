import { CouponSource } from '../coupon.types';

export class CreateCouponDto {
  number: string;
  company: string;
  source: CouponSource;
  purchaseDate: string;
  expiryDate: string;
  initialAmount: number;
  cvv?: string;
  tags?: string[];
  uncertain?: boolean;
}
