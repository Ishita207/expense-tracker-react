import ExpenseSummary from '../../components/ExpenseSummary';
import { useExpenseData } from '../../context/ExpenseDataContext';

function BudgetsPage() {
  const {
    totalIncome,
    totalExpense,
    totalInvestment,
    runningBalance,
    categoryTotals,
    selectedMonth,
    categoryBudgets,
    budgetUsage,
    setSelectedMonth,
    handleBudgetChange,
  } = useExpenseData();

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-8">
      <ExpenseSummary
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        totalInvestment={totalInvestment}
        runningBalance={runningBalance}
        categoryTotals={categoryTotals}
        selectedMonth={selectedMonth}
        categoryBudgets={categoryBudgets}
        budgetUsage={budgetUsage}
        onMonthChange={setSelectedMonth}
        onBudgetChange={handleBudgetChange}
      />
    </main>
  );
}

export default BudgetsPage;
