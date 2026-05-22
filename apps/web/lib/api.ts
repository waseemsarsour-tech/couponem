import type { Coupon, CreateCouponInput, Purchase, PurchaseWithCoupon, UpdateCouponInput, UseCouponInput } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message ?? `Request failed: ${res.status}`);
    (err as any).status = res.status;
    throw err;
  }
  return res.json();
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<{ ok: boolean }>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
    signup: (username: string, password: string) =>
      request<{ ok: boolean }>('/auth/signup', { method: 'POST', body: JSON.stringify({ username, password }) }),
    logout: () =>
      request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
  },
  coupons: {
    getActive: () => request<Coupon[]>('/coupons/active'),
    getUsed: () => request<Coupon[]>('/coupons/used'),
    getExpired: () => request<Coupon[]>('/coupons/expired'),
    getAllHistory: () => request<PurchaseWithCoupon[]>('/coupons/history'),
    getById: (id: string) => request<Coupon>(`/coupons/${id}`),
    getCouponHistory: (id: string) => request<Purchase[]>(`/coupons/${id}/history`),
    create: (data: CreateCouponInput) =>
      request<Coupon>('/coupons', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: UpdateCouponInput) =>
      request<Coupon>(`/coupons/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    use: (id: string, data: UseCouponInput) =>
      request<{ coupon: Coupon; purchase: Purchase }>(`/coupons/${id}/use`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};
