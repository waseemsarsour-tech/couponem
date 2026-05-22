'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CouponFormDialog } from '@/components/coupon-form-dialog';
import { UseCouponDialog } from '@/components/use-coupon-dialog';
import { HistoryTable } from '@/components/history-table';
import { api } from '@/lib/api';
import { cn, formatCurrency, formatDate, SOURCE_LABELS } from '@/lib/utils';

const URGENCY_BORDER: Record<string, string> = {
  red: 'border-t-4 border-t-red-500',
  yellow: 'border-t-4 border-t-amber-400',
  blue: 'border-t-4 border-t-blue-500',
};

export default function CouponDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [editOpen, setEditOpen] = useState(false);
  const [useOpen, setUseOpen] = useState(false);

  const { data: coupon, isLoading } = useQuery({
    queryKey: ['coupons', id],
    queryFn: () => api.coupons.getById(id),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!coupon) return <p className="text-destructive">Coupon not found.</p>;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{coupon.company}</h1>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="w-4 h-4 mr-1" /> Edit
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className={cn(coupon.urgency && URGENCY_BORDER[coupon.urgency])}>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Row label="Coupon #" value={`#${coupon.number}`} />
            <Row label="Source" value={SOURCE_LABELS[coupon.source] ?? coupon.source} />
            <Row label="Bought" value={formatDate(coupon.purchaseDate)} />
            <Row label="Expires" value={formatDate(coupon.expiryDate)} />
            <Row label="Initial Amount" value={formatCurrency(coupon.initialAmount)} />
            <Row label="Remaining" value={
              <span className="font-bold text-base">{formatCurrency(coupon.remainingAmount)}</span>
            } />
            {coupon.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {coupon.tags.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {coupon.remainingAmount > 0 ? (
              <Button onClick={() => setUseOpen(true)}>Use this coupon</Button>
            ) : (
              <p className="text-sm text-muted-foreground">This coupon has been fully used.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Purchase History</h2>
        <HistoryTable purchases={coupon.purchases} />
      </div>

      <CouponFormDialog open={editOpen} onClose={() => setEditOpen(false)} coupon={coupon} />
      <UseCouponDialog coupon={coupon} open={useOpen} onClose={() => setUseOpen(false)} />
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
