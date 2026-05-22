'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle, Archive } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CouponCard } from '@/components/coupon-card';
import { CouponFormDialog } from '@/components/coupon-form-dialog';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { PRESET_TAGS } from '@/lib/constants';
import type { Coupon } from '@/lib/types';

function sortByExpiry(coupons: Coupon[]) {
  return [...coupons].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
}

export default function HomePage() {
  const [addOpen, setAddOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const qc = useQueryClient();
  const { data: rawActive = [], isLoading: loadingActive } = useQuery({ queryKey: ['coupons', 'active'], queryFn: api.coupons.getActive });
  const { data: used = [], isLoading: loadingUsed } = useQuery({ queryKey: ['coupons', 'used'], queryFn: api.coupons.getUsed });
  const { data: expired = [], isLoading: loadingExpired } = useQuery({ queryKey: ['coupons', 'expired'], queryFn: api.coupons.getExpired });
  const { data: uncertain = [], isLoading: loadingUncertain } = useQuery({ queryKey: ['coupons', 'uncertain'], queryFn: api.coupons.getUncertain });

  const resolveUncertain = useMutation({
    mutationFn: ({ id, markUsed }: { id: string; markUsed: boolean }) =>
      api.coupons.update(id, { uncertain: false, ...(markUsed && { remainingAmount: 0 }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }),
  });

  const active = sortByExpiry(rawActive);
  const tags = PRESET_TAGS;
  const filteredActive = selectedTag ? active.filter((c) => c.tags.includes(selectedTag)) : active;
  const totalRemaining = active.reduce((sum, c) => sum + c.remainingAmount, 0);

  function toggleTag(tag: string) {
    setSelectedTag((prev) => (prev === tag ? null : tag));
  }

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Coupons</h1>
          <p className="text-muted-foreground mt-1">
            {active.length} active coupon{active.length !== 1 ? 's' : ''} · ₪{totalRemaining.toFixed(2)} total remaining
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Coupon
        </Button>
      </div>

      <Tabs defaultValue="active" onValueChange={() => setSelectedTag(null)}>
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active <CountPill n={active.length} /></TabsTrigger>
          <TabsTrigger value="used">Used <CountPill n={used.length} /></TabsTrigger>
          <TabsTrigger value="expired">Expired <CountPill n={expired.length} /></TabsTrigger>
          <TabsTrigger value="uncertain">Uncertain <CountPill n={uncertain.length} /></TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {tags.length > 0 && (
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <span className="text-xs text-muted-foreground">Filter:</span>
              {tags.map((tag: string) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'text-xs px-3 py-1 rounded-full border capitalize transition-colors',
                    selectedTag === tag
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-white text-muted-foreground border-border hover:border-primary hover:text-primary',
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
          <CouponGrid coupons={filteredActive} loading={loadingActive} emptyText={selectedTag ? `No active coupons tagged "${selectedTag}".` : 'No active coupons. Add one to get started.'} />
        </TabsContent>

        <TabsContent value="used">
          <CouponGrid coupons={used} loading={loadingUsed} emptyText="No fully used coupons yet." />
        </TabsContent>

        <TabsContent value="expired">
          <CouponGrid coupons={expired} loading={loadingExpired} emptyText="No expired coupons." />
        </TabsContent>

        <TabsContent value="uncertain">
          {loadingUncertain ? (
            <p className="text-muted-foreground py-4">Loading...</p>
          ) : uncertain.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground"><p className="text-lg">No uncertain coupons.</p></div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {uncertain.map((c) => (
                <div key={c.id} className="flex flex-col gap-2">
                  <CouponCard coupon={c} />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                      disabled={resolveUncertain.isPending}
                      onClick={() => resolveUncertain.mutate({ id: c.id, markUsed: false })}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Active
                    </Button>
                    <Button
                      size="sm" variant="outline"
                      className="flex-1 gap-1.5 text-muted-foreground hover:text-foreground"
                      disabled={resolveUncertain.isPending}
                      onClick={() => resolveUncertain.mutate({ id: c.id, markUsed: true })}
                    >
                      <Archive className="w-3.5 h-3.5" /> Mark Used
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CouponFormDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}

function CountPill({ n }: { n: number }) {
  if (n === 0) return null;
  return (
    <span className="ml-1.5 bg-primary/15 text-primary text-xs font-semibold px-1.5 py-0.5 rounded-full">{n}</span>
  );
}

function CouponGrid({ coupons, loading, emptyText }: { coupons: Coupon[]; loading: boolean; emptyText: string }) {
  if (loading) return <p className="text-muted-foreground py-4">Loading...</p>;
  if (coupons.length === 0) return <div className="text-center py-16 text-muted-foreground"><p className="text-lg">{emptyText}</p></div>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {coupons.map((c) => <CouponCard key={c.id} coupon={c} />)}
    </div>
  );
}
