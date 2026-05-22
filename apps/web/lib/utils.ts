import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatCurrency(amount: number) {
  return `₪${amount.toFixed(2)}`;
}

export const SOURCE_LABELS: Record<string, string> = {
  'leumi-bonus': 'Leumi Bonus',
  shelach: 'שלך',
  buyme: 'BuyMe',
};
