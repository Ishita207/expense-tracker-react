import { memo } from 'react';
import CategoryLabel from './CategoryLabel';
import { BUDGET_STATUS_BAR_CLASS } from '../utils/budgetProgress';
import { formatCurrency } from '../utils/formatCurrency';
import { formatIndianMonth } from '../utils/indiaDate';

function ExpenseSummary({
  totalIncome,
  totalExpense,
  totalInvestment,
  runningBalance,
  categoryTotals,
  selectedMonth,
  categoryBudgets,
  budgetUsage,
  onMonthChange,
  onBudgetChange,
}) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Running Balance</h2>
      <p className="mt-2 text-3xl font-bold text-slate-900">{formatCurrency(runningBalance)}</p>
      <p className="mt-2 text-sm text-slate-600">
        Income: <strong>{formatCurrency(totalIncome)}</strong>
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Expense: <strong>{formatCurrency(totalExpense)}</strong>
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Investment: <strong>{formatCurrency(totalInvestment)}</strong>
      </p>

      <h3 className="mt-4 text-lg font-semibold text-slate-900">Monthly Budgets</h3>
      <label className="mt-3 grid gap-1 text-sm text-slate-700">
        Month
        <input
          type="month"
          value={selectedMonth}
          onChange={(event) => onMonthChange(event.target.value)}
          className="field-control"
        />
      </label>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Object.keys(categoryBudgets).map((category) => (
          <label key={category.name} className="grid gap-1 text-sm text-slate-700">
            <span className="inline-flex items-center gap-1">
              <CategoryLabel category={category.name} />
              <span className="text-slate-500">budget</span>
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              name={category.name}
              value={categoryBudgets[category]}
              onChange={onBudgetChange}
              placeholder="0.00"
              className="field-control"
            />
          </label>
        ))}
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        Category Usage ({formatIndianMonth(selectedMonth)})
      </h3>
      {Object.keys(categoryTotals).length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No expenses added for this month yet.</p>
      ) : (
        <div className="mt-3 grid gap-3">
          {budgetUsage.map(({ category, spent, limit, usagePercent, status }) => {
            const overAmount = spent - limit;
            return (
              <div key={category.name} className="rounded-xl bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <CategoryLabel category={category.name} />
                  <div className="text-right">
                    <strong>
                      {formatCurrency(spent)} / {limit > 0 ? formatCurrency(limit) : 'No limit'}
                    </strong>
                    {status === 'over' && (
                      <p className="mt-0.5 text-xs font-semibold text-rose-600">
                        +{formatCurrency(overAmount)} over
                      </p>
                    )}
                  </div>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${BUDGET_STATUS_BAR_CLASS[status]}`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default memo(ExpenseSummary);
