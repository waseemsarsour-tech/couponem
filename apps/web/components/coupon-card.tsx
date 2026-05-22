'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UseCouponDialog } from './use-coupon-dialog';
import { cn, formatCurrency, formatDate, SOURCE_LABELS } from '@/lib/utils';
import type { Coupon } from '@/lib/types';

const URGENCY_STYLES: Record<string, { bar: string; badge: string; border: string }> = {
  red:    { bar: 'bg-red-500',    badge: 'bg-red-50 text-red-700 border-red-200',    border: 'border-t-4 border-t-red-500' },
  yellow: { bar: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 border-amber-200', border: 'border-t-4 border-t-amber-400' },
  blue:   { bar: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700 border-blue-200',  border: 'border-t-4 border-t-blue-500' },
};

export function CouponCard({ coupon }: { coupon: Coupon }) {
  const [useOpen, setUseOpen] = useState(false);
  const urgencyStyle = coupon.urgency ? URGENCY_STYLES[coupon.urgency] : null;
  const pctRemaining = Math.max(0, (coupon.remainingAmount / coupon.initialAmount) * 100);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const expiry = new Date(coupon.expiryDate); expiry.setHours(0, 0, 0, 0);
  const days = Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <>
      <div className={cn(
        'bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden border border-border',
        urgencyStyle?.border,
      )}>
        {/* Header strip */}
        <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-base leading-tight truncate">{coupon.company}</p>
            <p className="text-xs text-muted-foreground mt-0.5">#{coupon.number}</p>
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs">{SOURCE_LABELS[coupon.source] ?? coupon.source}</Badge>
        </div>

        {/* Balance */}
        <div className="px-4 pb-3">
          <div className="flex items-end justify-between mb-1.5">
            <div>
              <span className="text-2xl font-bold text-foreground">{formatCurrency(coupon.remainingAmount)}</span>
              <span className="text-xs text-muted-foreground ml-1.5">of {formatCurrency(coupon.initialAmount)}</span>
            </div>
            {urgencyStyle && (
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', urgencyStyle.badge)}>
                {days > 0 ? `${days}d left` : days === 0 ? 'Today' : 'Expired'}
              </span>
            )}
          </div>
          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', urgencyStyle?.bar ?? 'bg-slate-300')}
              style={{ width: `${pctRemaining}%` }}
            />
          </div>
        </div>

        {/* Meta */}
        <div className="px-4 pb-3 space-y-1.5 border-t border-border pt-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>Expires {formatDate(coupon.expiryDate)}</span>
          </div>
          {coupon.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              {coupon.tags.map((tag) => (
                <span key={tag} className="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5 capitalize">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 pt-2 flex gap-2 mt-auto">
          {coupon.remainingAmount > 0 && (
            <Button size="sm" className="flex-1" onClick={() => setUseOpen(true)}>Use</Button>
          )}
          <Button size="sm" variant="outline" className="flex-1" asChild>
            <Link href={`/coupons/${coupon.id}`}>Details</Link>
          </Button>
        </div>
      </div>

      <UseCouponDialog coupon={coupon} open={useOpen} onClose={() => setUseOpen(false)} />
    </>
  );
}
