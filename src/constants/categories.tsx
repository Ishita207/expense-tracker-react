import {
  MoneyIcon,
  ComputerTowerIcon,
  ChartLineIcon,
  GiftIcon,
  PlantIcon,
  BusIcon,
  ShoppingCartIcon,
  ReceiptIcon,
  HeartIcon,
  PlaceholderIcon,
} from '@phosphor-icons/react';

export const categories = [
  { name: 'Salary', icon: MoneyIcon, color: '#16a34a' },
  { name: 'Freelance', icon: ComputerTowerIcon, color: '#65a30d' },
  { name: 'Investments', icon: ChartLineIcon, color: '#4f46e5' },
  { name: 'Gifts', icon: GiftIcon, color: '#a855f7' },
  { name: 'Food', icon: PlantIcon, color: '#f97316' },
  { name: 'Transport', icon: BusIcon, color: '#14b8a6' },
  { name: 'Shopping', icon: ShoppingCartIcon, color: '#ec4899' },
  { name: 'Bills', icon: ReceiptIcon, color: '#0ea5e9' },
  { name: 'Health', icon: HeartIcon, color: '#e11d48' },
  { name: 'Other', icon: PlaceholderIcon, color: '#64748b' },
] as const;

export type Category = (typeof categories)[number];

export const budgetCategories = categories.filter(
  (category) =>
    category.name !== 'Salary' &&
    category.name !== 'Investments' &&
    category.name !== 'Freelance'
);

export function getCategoryMeta(category: string) {
  return (
    categories.find((c) => c.name === category) ??
    categories.find((c) => c.name === 'Other')!
  );
}

export function getCategoryColor(category: string): string {
  return getCategoryMeta(category).color;
}