import { createContext, useContext } from 'react';

const ExpenseDataContext = createContext(null);

export function ExpenseDataProvider({ value, children }) {
  return <ExpenseDataContext.Provider value={value}>{children}</ExpenseDataContext.Provider>;
}

export function useExpenseData() {
  const context = useContext(ExpenseDataContext);
  if (!context) {
    throw new Error('useExpenseData must be used inside ExpenseDataProvider.');
  }
  return context;
}
