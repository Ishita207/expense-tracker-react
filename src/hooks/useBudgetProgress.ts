import { useMemo } from 'react';
import type { BudgetUsage, CategoryBudgetMap, Transaction } from '../types/expense';
import { getBudgetFillPercent, getBudgetProgressStatus } from '../utils/budgetProgress';

/**
 * Computes spent vs limit per budget category.
 * Pass already month-scoped transactions if progress should be for a single month;
 * only `expense` rows count toward spent.
 */
function useBudgetProgress(
  budgets: CategoryBudgetMap,
  transactions: Transaction[]
): BudgetUsage[] {
  return useMemo(() => {
    const spentByCategory = transactions.reduce<Record<string, number>>((accumulator, transaction) => {
      if (transaction.type !== 'expense') {
        return accumulator;
      }
      const previousAmount = accumulator[transaction.category] || 0;
      return {
        ...accumulator,
        [transaction.category]: previousAmount + transaction.amount,
      };
    }, {});

    return Object.keys(budgets).map((category) => {
      const spent = spentByCategory[category] || 0;
      const limit = Number(budgets[category]) || 0;

      return {
        category,
        spent,
        limit,
        usagePercent: getBudgetFillPercent(spent, limit),
        status: getBudgetProgressStatus(spent, limit),
      };
    });
  }, [budgets, transactions]);
}

export default useBudgetProgress;
