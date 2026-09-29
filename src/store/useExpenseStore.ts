import { create } from 'zustand';
import { createJSONStorage, persist, type PersistOptions } from 'zustand/middleware';
import { budgetCategories } from '../constants/categories';
import type {
  CategoryBudgetMap,
  ExpenseStore,
  PersistedExpenseState,
  Theme,
} from '../types/expense';
import { getIndiaCurrentMonthISO } from '../utils/indiaDate';

const createDefaultBudgets = (): CategoryBudgetMap =>
  budgetCategories.reduce<CategoryBudgetMap>((accumulator, category) => {
    return { ...accumulator, [category.name]: 0 };
  }, {});

const persistOptions: PersistOptions<ExpenseStore, PersistedExpenseState> = {
  name: 'expense-tracker-store',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    expenses: state.expenses,
    selectedMonth: state.selectedMonth,
    categoryBudgets: state.categoryBudgets,
    theme: state.theme,
  }),
  merge: (persistedState, currentState) => {
    const persisted = (persistedState ?? {}) as Partial<PersistedExpenseState>;
    const persistedBudgets = persisted.categoryBudgets ?? {};
    const mergedBudgets = budgetCategories.reduce<CategoryBudgetMap>((accumulator, category) => {
      return {
        ...accumulator,
        [category.name]: persistedBudgets[category.name] ?? currentState.categoryBudgets[category.name] ?? 0,
      };
    }, {});

    return {
      ...currentState,
      ...persisted,
      categoryBudgets: mergedBudgets,
      theme: persisted.theme === 'dark' ? 'dark' : 'light',
    };
  },
  onRehydrateStorage: () => (state) => {
    state?.setHasHydrated(true);
  },
};

const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      expenses: [],
      selectedMonth: getIndiaCurrentMonthISO(),
      categoryBudgets: createDefaultBudgets(),
      theme: 'light' satisfies Theme,
      hasHydrated: false,
      addExpenseEntry: (expense) =>
        set((state) => ({
          expenses: [expense, ...state.expenses],
        })),
      addExpenseEntries: (entries) =>
        set((state) => ({
          expenses: [...entries, ...state.expenses],
        })),
      updateExpenseEntry: (updatedExpense) =>
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === updatedExpense.id ? updatedExpense : expense
          ),
        })),
      deleteExpenseEntry: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        })),
      setSelectedMonth: (month) =>
        set(() => ({
          selectedMonth: month,
        })),
      setCategoryBudget: (category, value) =>
        set((state) => ({
          categoryBudgets: {
            ...state.categoryBudgets,
            [category]: value,
          },
        })),
      setTheme: (theme) =>
        set(() => ({
          theme,
        })),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),
      setHasHydrated: (value) =>
        set(() => ({
          hasHydrated: value,
        })),
    }),
    persistOptions
  )
);

export default useExpenseStore;
