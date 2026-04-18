import { Navigate, Route, Routes } from 'react-router-dom';
import { ExpenseDataProvider } from '../context/ExpenseDataContext';
import useExpenses from '../hooks/useExpenses';
import DashboardLayout from './dashboard/DashboardLayout';
import OverviewPage from './dashboard/OverviewPage';
import TransactionsPage from './dashboard/TransactionsPage';
import BudgetsPage from './dashboard/BudgetsPage';

function ExpenseTrackerScreen() {
  const expenseState = useExpenses();
  if (!expenseState.hasHydrated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4">
        <p className="text-sm text-slate-500">Loading your data...</p>
      </main>
    );
  }

  return (
    <ExpenseDataProvider value={expenseState}>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ExpenseDataProvider>
  );
}

export default ExpenseTrackerScreen;
