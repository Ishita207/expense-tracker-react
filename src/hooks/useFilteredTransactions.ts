import { useMemo } from 'react';
import type { Transaction, TransactionFilters } from '../types/expense';

function matchesFilters(transaction: Transaction, filters: TransactionFilters): boolean {
  const searchQuery = filters.searchQuery;
  if (searchQuery) {
    const query = searchQuery.trim().toLowerCase();
    const searchTarget = `${transaction.title} ${transaction.category} ${transaction.type}`.toLowerCase();
    if (!searchTarget.includes(query)) {
      return false;
    }
  }

  if (filters.category && filters.category !== 'all' && transaction.category !== filters.category) {
    return false;
  }

  if (filters.dateFrom && transaction.date < filters.dateFrom) {
    return false;
  }

  if (filters.dateTo && transaction.date > filters.dateTo) {
    return false;
  }

  if (filters.amountMin && transaction.amount < Number(filters.amountMin)) {
    return false;
  }

  if (filters.amountMax && transaction.amount > Number(filters.amountMax)) {
    return false;
  }

  return true;
}

function useFilteredTransactions(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
  const { searchQuery, category, amountMin, amountMax, dateFrom, dateTo } = filters;

  return useMemo(
    () =>
      transactions.filter((transaction) =>
        matchesFilters(transaction, {
          searchQuery,
          category,
          amountMin,
          amountMax,
          dateFrom,
          dateTo,
        })
      ),
    [amountMax, amountMin, category, dateFrom, dateTo, searchQuery, transactions]
  );
}

export default useFilteredTransactions;
