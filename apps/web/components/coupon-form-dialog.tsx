'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TagsSelect } from '@/components/tags-select';
import { api } from '@/lib/api';
import type { Coupon, CouponSource, CreateCouponInput, UpdateCouponInput } from '@/lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
  coupon?: Coupon;
}

const SOURCES: { value: CouponSource; label: string }[] = [
  { value: 'leumi-bonus', label: 'Leumi Bonus' },
  { value: 'shelach', label: 'שלך' },
  { value: 'buyme', label: 'BuyMe' },
];

function toDateInput(date?: string) {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}

export function CouponFormDialog({ open, onClose, coupon }: Props) {
  const isEdit = !!coupon;
  const qc = useQueryClient();

  const [form, setForm] = useState({
    number: coupon?.number ?? '',
    company: coupon?.company ?? '',
    source: (coupon?.source ?? 'shelach') as CouponSource,
    purchaseDate: toDateInput(coupon?.purchaseDate ?? new Date().toISOString()),
    expiryDate: toDateInput(coupon?.expiryDate),
    initialAmount: coupon?.initialAmount?.toString() ?? '',
    cvv: coupon?.cvv ?? '',
    tags: coupon?.tags ?? [],
    uncertain: coupon?.uncertain ?? false,
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (isEdit) {
        const data: UpdateCouponInput = {
          number: form.number,
          company: form.company,
          source: form.source,
          purchaseDate: form.purchaseDate,
          expiryDate: form.expiryDate,
          cvv: form.cvv || undefined,
          tags: form.tags,
          uncertain: form.uncertain,
        };
        return api.coupons.update(coupon.id, data);
      }
      const data: CreateCouponInput = {
        number: form.number,
        company: form.company,
        source: form.source,
        purchaseDate: form.purchaseDate,
        expiryDate: form.expiryDate,
        initialAmount: parseFloat(form.initialAmount),
        cvv: form.cvv || undefined,
        tags: form.tags,
        uncertain: form.uncertain,
      };
      return api.coupons.create(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] });
      onClose();
    },
  });

  function set<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
          <DialogDescription className="sr-only">Fill in the coupon details below.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <Field label="Company">
            <Input value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Zara, McDonalds..." />
          </Field>
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <Field label="Coupon Number">
              <Input value={form.number} onChange={(e) => set('number', e.target.value)} placeholder="1234-5678" />
            </Field>
            <Field label="CVV (optional)">
              <Input
                value={form.cvv}
                onChange={(e) => set('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="123"
                className="w-20"
              />
            </Field>
          </div>
          <Field label="Source">
            <Select value={form.source} onValueChange={(v) => set('source', v as CouponSource)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SOURCES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Purchase Date">
              <Input type="date" value={form.purchaseDate} onChange={(e) => set('purchaseDate', e.target.value)} />
            </Field>
            <Field label="Expiry Date">
              <Input type="date" value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} />
            </Field>
          </div>
          {!isEdit && (
            <Field label="Initial Amount (₪)">
              <Input type="number" min="0" step="0.01" value={form.initialAmount} onChange={(e) => set('initialAmount', e.target.value)} placeholder="100.00" />
            </Field>
          )}
          <Field label="Tags">
            <TagsSelect value={form.tags} onChange={(tags) => set('tags', tags)} />
          </Field>
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => set('uncertain', !form.uncertain)}
          >
            <Checkbox checked={form.uncertain} onCheckedChange={(v: boolean) => set('uncertain', v)} />
            <span className="text-sm">Not sure if still active (add to Uncertain list)</span>
          </div>
        </div>

        {mutation.error && (
          <p className="text-sm text-destructive">{(mutation.error as Error).message}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Coupon'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
