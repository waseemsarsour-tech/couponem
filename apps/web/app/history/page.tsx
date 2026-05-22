'use client';

import { useQuery } from '@tanstack/react-query';
import { HistoryTable } from '@/components/history-table';
import { api } from '@/lib/api';

export default function HistoryPage() {
  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['coupons', 'history'],
    queryFn: api.coupons.getAllHistory,
  });

  const total = purchases.reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Purchase History</h1>
        <p className="text-muted-foreground mt-1">
          {purchases.length} transaction{purchases.length !== 1 ? 's' : ''} · ₪{total.toFixed(2)} total spent
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {isLoading ? (
          <p className="text-muted-foreground p-6">Loading...</p>
        ) : (
          <HistoryTable purchases={purchases} showCoupon />
        )}
      </div>
    </>
  );
}
