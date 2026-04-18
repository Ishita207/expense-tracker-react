import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ExpenseForm from '../../components/ExpenseForm';
import ExpenseList from '../../components/ExpenseList';
import { categories } from '../../constants/categories';
import { useExpenseData } from '../../context/ExpenseDataContext';

function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    formData,
    editingId,
    handleFormChange,
    addExpense,
    cancelEditExpense,
    expenses,
    deleteExpense,
    startEditExpense,
  } = useExpenseData();
  const initialDateFrom = searchParams.get('dateFrom') || '';
  const initialDateTo = searchParams.get('dateTo') || '';
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');

  useEffect(() => {
    setDateFrom(searchParams.get('dateFrom') || '');
    setDateTo(searchParams.get('dateTo') || '');
  }, [searchParams]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      if (searchQuery) {
        const query = searchQuery.trim().toLowerCase();
        const searchTarget = `${expense.title} ${expense.category} ${expense.type}`.toLowerCase();
        if (!searchTarget.includes(query)) {
          return false;
        }
      }
      if (selectedCategory !== 'all' && expense.category !== selectedCategory) {
        return false;
      }
      if (dateFrom && expense.date < dateFrom) {
        return false;
      }
      if (dateTo && expense.date > dateTo) {
        return false;
      }
      if (amountMin && expense.amount < Number(amountMin)) {
        return false;
      }
      if (amountMax && expense.amount > Number(amountMax)) {
        return false;
      }
      return true;
    });
  }, [amountMax, amountMin, dateFrom, dateTo, expenses, searchQuery, selectedCategory]);

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-8 md:grid-cols-2">
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Transactions</h2>
        <p className="mt-1 text-sm text-slate-500">Add, edit, or remove income and expense entries.</p>
        <ExpenseForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={addExpense}
          isEditing={Boolean(editingId)}
          onCancelEdit={cancelEditExpense}
        />
      </section>
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2 grid gap-1 text-sm text-slate-700">
            Search
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by title, category, or type"
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="grid gap-1 text-sm text-slate-700">
            Category
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm text-slate-700">
            Min amount
            <input
              type="number"
              min="0"
              step="0.01"
              value={amountMin}
              onChange={(event) => setAmountMin(event.target.value)}
              placeholder="0.00"
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="grid gap-1 text-sm text-slate-700">
            Max amount
            <input
              type="number"
              min="0"
              step="0.01"
              value={amountMax}
              onChange={(event) => setAmountMax(event.target.value)}
              placeholder="0.00"
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="grid gap-1 text-sm text-slate-700">
            From date
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                const value = event.target.value;
                setDateFrom(value);
                setSearchParams((previous) => {
                  const next = new URLSearchParams(previous);
                  if (value) {
                    next.set('dateFrom', value);
                  } else {
                    next.delete('dateFrom');
                  }
                  return next;
                });
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="grid gap-1 text-sm text-slate-700">
            To date
            <input
              type="date"
              value={dateTo}
              onChange={(event) => {
                const value = event.target.value;
                setDateTo(value);
                setSearchParams((previous) => {
                  const next = new URLSearchParams(previous);
                  if (value) {
                    next.set('dateTo', value);
                  } else {
                    next.delete('dateTo');
                  }
                  return next;
                });
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {filteredExpenses.length} of {expenses.length} transactions
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-800 hover:bg-emerald-200"
              onClick={() => exportTransactionsToCsv(filteredExpenses)}
              disabled={filteredExpenses.length === 0}
            >
              Export CSV
            </button>
            <button
              type="button"
              className="rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-200"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setAmountMin('');
                setAmountMax('');
                setDateFrom('');
                setDateTo('');
                setSearchParams({});
              }}
              disabled={
                !searchQuery &&
                selectedCategory === 'all' &&
                !amountMin &&
                !amountMax &&
                !dateFrom &&
                !dateTo
              }
            >
              Clear filter
            </button>
          </div>
        </div>
        <div className="mt-3">
          <ExpenseList expenses={filteredExpenses} onDelete={deleteExpense} onEdit={startEditExpense} />
        </div>
      </section>
    </main>
  );
}

function exportTransactionsToCsv(transactions) {
  const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Recurring'];
  const rows = transactions.map((transaction) => [
    transaction.date,
    transaction.title,
    transaction.type,
    transaction.category,
    transaction.amount,
    transaction.isRecurring ? 'Yes' : 'No',
  ]);
  const csvContent = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default TransactionsPage;
