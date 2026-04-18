import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { budgetCategories } from '../constants/categories';
import { getIndiaCurrentMonthISO } from '../utils/indiaDate';

const createDefaultBudgets = () =>
  budgetCategories.reduce((accumulator, category) => {
    return { ...accumulator, [category]: 0 };
  }, {});

const useExpenseStore = create(
  persist(
    (set) => ({
      expenses: [],
      selectedMonth: getIndiaCurrentMonthISO(),
      categoryBudgets: createDefaultBudgets(),
      theme: 'light',
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
    {
      name: 'expense-tracker-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        expenses: state.expenses,
        selectedMonth: state.selectedMonth,
        categoryBudgets: state.categoryBudgets,
        theme: state.theme,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState || {};
        const persistedBudgets = persisted.categoryBudgets || {};
        const mergedBudgets = budgetCategories.reduce((accumulator, category) => {
          return {
            ...accumulator,
            [category]: persistedBudgets[category] ?? currentState.categoryBudgets[category] ?? 0,
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
    }
  )
);

export default useExpenseStore;
