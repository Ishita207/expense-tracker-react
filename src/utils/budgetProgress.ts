import type { BudgetProgressStatus } from '../types/expense';

/** Fill width for the progress bar — never exceeds 100%. */
export function getBudgetFillPercent(spent: number, limit: number): number {
  if (limit <= 0) {
    return 0;
  }
  return Math.min((spent / limit) * 100, 100);
}

/**
 * green <80%, amber 80–100%, red >100%.
 * Exactly 100% is amber; over-budget is only when spent exceeds the limit.
 */
export function getBudgetProgressStatus(spent: number, limit: number): BudgetProgressStatus {
  if (limit <= 0) {
    return 'no-limit';
  }

  const ratio = spent / limit;
  if (ratio > 1) {
    return 'over';
  }
  if (ratio >= 0.8) {
    return 'warning';
  }
  return 'ok';
}

export const BUDGET_STATUS_BAR_CLASS: Record<BudgetProgressStatus, string> = {
  ok: 'bg-emerald-500',
  warning: 'bg-amber-500',
  over: 'bg-rose-500',
  'no-limit': 'bg-slate-300',
};
