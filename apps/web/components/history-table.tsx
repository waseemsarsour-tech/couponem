import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Purchase, PurchaseWithCoupon } from '@/lib/types';

interface Props {
  purchases: (Purchase | PurchaseWithCoupon)[];
  showCoupon?: boolean;
}

function hasCoupon(p: Purchase | PurchaseWithCoupon): p is PurchaseWithCoupon {
  return 'couponNumber' in p;
}

export function HistoryTable({ purchases, showCoupon = false }: Props) {
  if (purchases.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No purchase history yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showCoupon && <TableHead>Company</TableHead>}
          {showCoupon && <TableHead>Coupon #</TableHead>}
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Note</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchases.map((p) => (
          <TableRow key={p.id}>
            {showCoupon && hasCoupon(p) && <TableCell className="font-medium">{p.couponCompany}</TableCell>}
            {showCoupon && hasCoupon(p) && <TableCell className="text-muted-foreground">#{p.couponNumber}</TableCell>}
            <TableCell>{formatDate(p.date)}</TableCell>
            <TableCell>{formatCurrency(p.amount)}</TableCell>
            <TableCell className="text-muted-foreground">{p.note ?? '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
