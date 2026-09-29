import { useMemo } from 'react';
import type { Transaction, TransactionTotals } from '../types/expense';

function useTransactionTotals(transactions: Transaction[]): TransactionTotals {
  return useMemo(() => {
    const totals = transactions.reduce(
      (accumulator, transaction) => {
        if (transaction.type === 'income') {
          accumulator.totalIncome += transaction.amount;
        } else if (transaction.type === 'expense') {
          accumulator.totalExpense += transaction.amount;
        } else if (transaction.type === 'investment') {
          accumulator.totalInvestment += transaction.amount;
        }
        return accumulator;
      },
      { totalIncome: 0, totalExpense: 0, totalInvestment: 0 }
    );

    return {
      ...totals,
      balance: totals.totalIncome - totals.totalExpense - totals.totalInvestment,
    };
  }, [transactions]);
}

export default useTransactionTotals;
