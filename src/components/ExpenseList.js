import { useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { formatIndianDate } from '../utils/indiaDate';

function ExpenseList({ expenses, onDelete, onEdit, itemsPerPage = 5 }) {
  const typeStyles = {
    income: { color: 'text-emerald-700', prefix: '+' },
    expense: { color: 'text-rose-700', prefix: '-' },
    investment: { color: 'text-indigo-700', prefix: '-' },
  };
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(expenses.length / itemsPerPage));
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return expenses.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, expenses, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startItem = expenses.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, expenses.length);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Recent Transactions</h2>
      {expenses.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Start by adding your first transaction.</p>
      ) : (
        <>
          <ul className="mt-3 grid gap-2">
            {paginatedExpenses.map((expense) => {
              const style = typeStyles[expense.type] || typeStyles.expense;
              return (
                <li
                  key={expense.id}
                  className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-3"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{expense.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {expense.type} - {expense.category} - {formatIndianDate(expense.date)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <strong className={`block ${style.color}`}>
                      {style.prefix}
                      {formatCurrency(expense.amount)}
                    </strong>
                    <button
                      type="button"
                      className="w-20 rounded-lg bg-indigo-100 px-2.5 py-1 text-center text-xs font-semibold text-indigo-900 hover:bg-indigo-200"
                      onClick={() => onEdit(expense.id)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="w-20 rounded-lg bg-rose-100 px-2.5 py-1 text-center text-xs font-semibold text-rose-800 hover:bg-rose-200"
                      onClick={() => onDelete(expense.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
            <p>
              Showing {startItem}-{endItem} of {expenses.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => setCurrentPage((previous) => Math.max(previous - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="font-semibold text-slate-700">
                Page {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => setCurrentPage((previous) => Math.min(previous + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default ExpenseList;
