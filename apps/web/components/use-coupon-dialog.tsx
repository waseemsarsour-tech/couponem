'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { Coupon } from '@/lib/types';

interface Props {
  coupon: Coupon;
  open: boolean;
  onClose: () => void;
}

export function UseCouponDialog({ coupon, open, onClose }: Props) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const mutation = useMutation({
    mutationFn: () => api.coupons.use(coupon.id, { amount: parseFloat(amount), note: note || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] });
      setAmount('');
      setNote('');
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Use Coupon — {coupon.company}</DialogTitle>
          <DialogDescription className="sr-only">Enter the amount and an optional note.</DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Remaining balance: <span className="font-semibold text-foreground">{formatCurrency(coupon.remainingAmount)}</span>
        </p>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Amount used (₪)</Label>
            <Input
              type="number"
              min="0.01"
              max={coupon.remainingAmount}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Note (optional)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you buy?" />
          </div>
        </div>

        {mutation.error && (
          <p className="text-sm text-destructive">{(mutation.error as Error).message}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !amount}>
            {mutation.isPending ? 'Saving...' : 'Confirm'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
