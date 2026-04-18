import { useEffect, useMemo, useState } from 'react';
import { budgetCategories } from '../constants/categories';
import { getIndiaTodayISO } from '../utils/indiaDate';
import useExpenseStore from '../store/useExpenseStore';

const createDefaultForm = () => ({
  title: '',
  amount: '',
  type: 'expense',
  category: 'Food',
  date: getIndiaTodayISO(),
  isRecurring: false,
  recurringSourceId: undefined,
});

function useExpenses() {
  const [formData, setFormData] = useState(createDefaultForm);
  const [editingId, setEditingId] = useState(null);
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

  const totalIncome = useMemo(
    () =>
      expenses.reduce(
        (total, expense) => total + (expense.type === 'income' ? expense.amount : 0),
        0
      ),
    [expenses]
  );

  const totalExpense = useMemo(
    () =>
      expenses.reduce(
        (total, expense) => total + (expense.type === 'expense' ? expense.amount : 0),
        0
      ),
    [expenses]
  );

  const totalInvestment = useMemo(
    () =>
      expenses.reduce(
        (total, expense) => total + (expense.type === 'investment' ? expense.amount : 0),
        0
      ),
    [expenses]
  );

  const runningBalance = totalIncome - totalExpense - totalInvestment;

  const categoryTotals = useMemo(() => {
    return expenses.reduce((accumulator, expense) => {
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
      const spent = categoryTotals[category] || 0;
      const limit = Number(categoryBudgets[category]) || 0;
      const usagePercent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

      return { category, spent, limit, usagePercent };
    });
  }, [categoryBudgets, categoryTotals]);

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'type' && value !== 'expense' ? { isRecurring: false } : {}),
    }));
  };

  const addExpense = (event) => {
    event.preventDefault();

    const parsedAmount = Number(formData.amount);
    if (!formData.title.trim() || parsedAmount <= 0) {
      return;
    }

    const newExpense = {
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
  };

  const deleteExpense = (id) => {
    deleteExpenseEntry(id);
    if (editingId === id) {
      setEditingId(null);
      setFormData(createDefaultForm());
    }
  };

  const startEditExpense = (id) => {
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
  };

  const cancelEditExpense = () => {
    setEditingId(null);
    setFormData(createDefaultForm());
  };

  const handleBudgetChange = (event) => {
    const { name, value } = event.target;
    setCategoryBudget(name, value);
  };

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const recurringEntries = getMissingRecurringEntries(expenses, getIndiaTodayISO());
    if (recurringEntries.length > 0) {
      addExpenseEntries(recurringEntries);
    }
  }, [addExpenseEntries, expenses, hasHydrated]);

  return {
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
  };
}

function getMissingRecurringEntries(expenses, todayIso) {
  const recurringBaseEntries = expenses.filter(
    (entry) => entry.isRecurring && (!entry.recurringSourceId || entry.recurringSourceId === entry.id)
  );
  if (recurringBaseEntries.length === 0) {
    return [];
  }

  const existingMonthsBySource = expenses.reduce((accumulator, entry) => {
    if (!entry.isRecurring) {
      return accumulator;
    }
    const sourceId = entry.recurringSourceId || entry.id;
    const monthKey = entry.date.slice(0, 7);
    const existingForSource = accumulator[sourceId] || new Set();
    existingForSource.add(monthKey);
    return { ...accumulator, [sourceId]: existingForSource };
  }, {});

  const todayMonth = todayIso.slice(0, 7);
  const generatedEntries = [];
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

function getMonthKeysBetween(startMonth, endMonth) {
  const [startYear, startMonthNum] = startMonth.split('-').map(Number);
  const [endYear, endMonthNum] = endMonth.split('-').map(Number);
  const current = new Date(startYear, startMonthNum - 1, 1);
  const end = new Date(endYear, endMonthNum - 1, 1);
  const monthKeys = [];

  while (current <= end) {
    monthKeys.push(
      `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
    );
    current.setMonth(current.getMonth() + 1);
  }

  return monthKeys;
}

function createDateForMonth(monthKey, dayOfMonth) {
  const [year, month] = monthKey.split('-').map(Number);
  const maxDay = new Date(year, month, 0).getDate();
  return `${monthKey}-${String(Math.min(dayOfMonth, maxDay)).padStart(2, '0')}`;
}

export default useExpenses;
