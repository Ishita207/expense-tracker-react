import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { budgetCategories } from '../constants/categories';
import useExpenseStore from '../store/useExpenseStore';
import type {
  BudgetUsage,
  CategoryBudgetMap,
  ExpenseFormData,
  Transaction,
} from '../types/expense';
import { getBudgetFillPercent, getBudgetProgressStatus } from '../utils/budgetProgress';
import { getIndiaTodayISO } from '../utils/indiaDate';
import useTransactionTotals from './useTransactionTotals';

const createDefaultForm = (): ExpenseFormData => ({
  title: '',
  amount: '',
  type: 'expense',
  category: 'Food',
  date: getIndiaTodayISO(),
  isRecurring: false,
  recurringSourceId: undefined,
});

export interface UseExpensesResult {
  formData: ExpenseFormData;
  expenses: Transaction[];
  editingId: string | null;
  totalIncome: number;
  totalExpense: number;
  totalInvestment: number;
  runningBalance: number;
  categoryTotals: Record<string, number>;
  selectedMonth: string;
  categoryBudgets: CategoryBudgetMap;
  budgetUsage: BudgetUsage[];
  hasHydrated: boolean;
  handleFormChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  addExpense: (event: FormEvent<HTMLFormElement>) => void;
  deleteExpense: (id: string) => void;
  startEditExpense: (id: string) => void;
  cancelEditExpense: () => void;
  setSelectedMonth: (month: string) => void;
  handleBudgetChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function useExpenses(): UseExpensesResult {
  const [formData, setFormData] = useState<ExpenseFormData>(createDefaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const expenses = useExpenseStore((state) => state.expenses);
  const selectedMonth = useExpenseStore((state) => state.selectedMonth);
  const categoryBudgets = useExpenseStore((state) => state.categoryBudgets);
  const addExpenseEntry = useExpenseStore((state) => state.addExpenseEntry);
  const addExpenseEntries = useExpenseStore((state) => state.addExpenseEntries);
  const updateExpenseEntry = useExpenseStore((state) => state.updateExpenseEntry);
  const deleteExpenseEntry = useExpenseStore((state) => state.deleteExpenseEntry);
  const setSelectedMonth = useExpenseStore((state) => state.setSelectedMonth);
  const setCategoryBudget = useExpenseStore((state) => state.setCategoryBudget);
  const hasHydrated = useExpenseStore((state) => state.hasHydrated);

  const { totalIncome, totalExpense, totalInvestment, balance: runningBalance } =
    useTransactionTotals(expenses);

  const categoryTotals = useMemo(() => {
    return expenses.reduce<Record<string, number>>((accumulator, expense) => {
      if (expense.type !== 'expense' || !expense.date.startsWith(selectedMonth)) {
        return accumulator;
      }

      const previousAmount = accumulator[expense.category] || 0;
      return {
        ...accumulator,
        [expense.category]: previousAmount + expense.amount,
      };
    }, {});
  }, [expenses, selectedMonth]);

  const budgetUsage = useMemo(() => {
    return budgetCategories.map((category) => {
      const spent = categoryTotals[category.name] || 0;
      const limit = Number(categoryBudgets[category.name]) || 0;

      return {
        category: category.name,
        spent,
        limit,
        usagePercent: getBudgetFillPercent(spent, limit),
        status: getBudgetProgressStatus(spent, limit),
      };
    });
  }, [categoryBudgets, categoryTotals]);

  const handleFormChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      const isCheckbox =
        event.target instanceof HTMLInputElement && event.target.type === 'checkbox';
      const checked = event.target instanceof HTMLInputElement ? event.target.checked : false;

      setFormData((previous) => ({
        ...previous,
        [name]: isCheckbox ? checked : value,
        ...(name === 'type' && value !== 'expense' ? { isRecurring: false } : {}),
      }));
    },
    []
  );

  const addExpense = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const parsedAmount = Number(formData.amount);
      if (!formData.title.trim() || parsedAmount <= 0) {
        return;
      }

      const newExpense: Transaction = {
        id: editingId || crypto.randomUUID(),
        title: formData.title.trim(),
        amount: parsedAmount,
        type: formData.type,
        category: formData.category,
        date: formData.date,
        isRecurring: formData.type === 'expense' && Boolean(formData.isRecurring),
        recurringSourceId:
          formData.type === 'expense' && Boolean(formData.isRecurring)
            ? formData.recurringSourceId || editingId || undefined
            : undefined,
      };

      if (editingId) {
        updateExpenseEntry(newExpense);
      } else {
        addExpenseEntry(newExpense);
      }

      setEditingId(null);
      setFormData((previous) => ({ ...createDefaultForm(), date: previous.date }));
    },
    [addExpenseEntry, editingId, formData, updateExpenseEntry]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      deleteExpenseEntry(id);
      if (editingId === id) {
        setEditingId(null);
        setFormData(createDefaultForm());
      }
    },
    [deleteExpenseEntry, editingId]
  );

  const startEditExpense = useCallback(
    (id: string) => {
      const matchingExpense = expenses.find((expense) => expense.id === id);
      if (!matchingExpense) {
        return;
      }

      setEditingId(id);
      setFormData({
        title: matchingExpense.title,
        amount: String(matchingExpense.amount),
        type: matchingExpense.type,
        category: matchingExpense.category,
        date: matchingExpense.date,
        isRecurring: Boolean(matchingExpense.isRecurring),
        recurringSourceId: matchingExpense.recurringSourceId,
      });
    },
    [expenses]
  );

  const cancelEditExpense = useCallback(() => {
    setEditingId(null);
    setFormData(createDefaultForm());
  }, []);

  const handleBudgetChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setCategoryBudget(name, value);
    },
    [setCategoryBudget]
  );

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const recurringEntries = getMissingRecurringEntries(expenses, getIndiaTodayISO());
    if (recurringEntries.length > 0) {
      addExpenseEntries(recurringEntries);
    }
  }, [addExpenseEntries, expenses, hasHydrated]);

  return useMemo(
    () => ({
      formData,
      expenses,
      editingId,
      totalIncome,
      totalExpense,
      totalInvestment,
      runningBalance,
      categoryTotals,
      selectedMonth,
      categoryBudgets,
      budgetUsage,
      hasHydrated,
      handleFormChange,
      addExpense,
      deleteExpense,
      startEditExpense,
      cancelEditExpense,
      setSelectedMonth,
      handleBudgetChange,
    }),
    [
      addExpense,
      budgetUsage,
      cancelEditExpense,
      categoryBudgets,
      categoryTotals,
      deleteExpense,
      editingId,
      expenses,
      formData,
      handleBudgetChange,
      handleFormChange,
      hasHydrated,
      runningBalance,
      selectedMonth,
      setSelectedMonth,
      startEditExpense,
      totalExpense,
      totalIncome,
      totalInvestment,
    ]
  );
}

function getMissingRecurringEntries(expenses: Transaction[], todayIso: string): Transaction[] {
  const recurringBaseEntries = expenses.filter(
    (entry) => entry.isRecurring && (!entry.recurringSourceId || entry.recurringSourceId === entry.id)
  );
  if (recurringBaseEntries.length === 0) {
    return [];
  }

  const existingMonthsBySource = expenses.reduce<Record<string, Set<string>>>(
    (accumulator, entry) => {
      if (!entry.isRecurring) {
        return accumulator;
      }
      const sourceId = entry.recurringSourceId || entry.id;
      const monthKey = entry.date.slice(0, 7);
      const existingForSource = accumulator[sourceId] || new Set<string>();
      existingForSource.add(monthKey);
      return { ...accumulator, [sourceId]: existingForSource };
    },
    {}
  );

  const todayMonth = todayIso.slice(0, 7);
  const generatedEntries: Transaction[] = [];
  recurringBaseEntries.forEach((entry) => {
    const sourceId = entry.id;
    const sourceDay = Number(entry.date.slice(8, 10));
    const sourceMonth = entry.date.slice(0, 7);
    const monthsToBackfill = getMonthKeysBetween(sourceMonth, todayMonth).slice(1);
    const existingMonths = existingMonthsBySource[sourceId] || new Set([sourceMonth]);

    monthsToBackfill.forEach((monthKey) => {
      if (existingMonths.has(monthKey)) {
        return;
      }
      generatedEntries.push({
        ...entry,
        id: crypto.randomUUID(),
        date: createDateForMonth(monthKey, sourceDay),
        recurringSourceId: sourceId,
      });
    });
  });

  return generatedEntries.sort((first, second) => second.date.localeCompare(first.date));
}

function getMonthKeysBetween(startMonth: string, endMonth: string): string[] {
  const [startYear, startMonthNum] = startMonth.split('-').map(Number);
  const [endYear, endMonthNum] = endMonth.split('-').map(Number);
  const current = new Date(startYear, startMonthNum - 1, 1);
  const end = new Date(endYear, endMonthNum - 1, 1);
  const monthKeys: string[] = [];

  while (current <= end) {
    monthKeys.push(
      `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
    );
    current.setMonth(current.getMonth() + 1);
  }

  return monthKeys;
}

function createDateForMonth(monthKey: string, dayOfMonth: number): string {
  const [year, month] = monthKey.split('-').map(Number);
  const maxDay = new Date(year, month, 0).getDate();
  return `${monthKey}-${String(Math.min(dayOfMonth, maxDay)).padStart(2, '0')}`;
}

export default useExpenses;
