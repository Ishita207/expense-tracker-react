import ExpenseInsights from '../../components/ExpenseInsights';
import { useExpenseData } from '../../context/ExpenseDataContext';
import { formatCurrency } from '../../utils/formatCurrency';

function OverviewPage() {
  const {
    totalIncome,
    totalExpense,
    totalInvestment,
    runningBalance,
    expenses,
    selectedMonth,
    setSelectedMonth,
  } = useExpenseData();

  return (
    <main className="grid w-full gap-4 px-4 py-8 sm:px-6 lg:px-8 xl:px-10 md:grid-cols-3">
      <section className="rounded-2xl bg-white p-4 shadow-sm md:col-span-3">
        <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
        <p className="mt-1 text-sm text-slate-500">Quick snapshot of your financial position.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl bg-slate-50 p-4">
            <span className="text-sm text-slate-500">Balance</span>
            <strong className="mt-1 block text-lg font-semibold">{formatCurrency(runningBalance)}</strong>
          </article>
          <article className="rounded-xl bg-slate-50 p-4">
            <span className="text-sm text-slate-500">Income</span>
            <strong className="mt-1 block text-lg font-semibold text-emerald-700">
              {formatCurrency(totalIncome)}
            </strong>
          </article>
          <article className="rounded-xl bg-slate-50 p-4">
            <span className="text-sm text-slate-500">Expense</span>
            <strong className="mt-1 block text-lg font-semibold text-rose-700">
              {formatCurrency(totalExpense)}
            </strong>
          </article>
          <article className="rounded-xl bg-slate-50 p-4">
            <span className="text-sm text-slate-500">Investment</span>
            <strong className="mt-1 block text-lg font-semibold text-indigo-700">
              {formatCurrency(totalInvestment)}
            </strong>
          </article>
        </div>
      </section>
      <div className="md:col-span-3">
        <ExpenseInsights
          expenses={expenses}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      </div>
    </main>
  );
}

export default OverviewPage;
