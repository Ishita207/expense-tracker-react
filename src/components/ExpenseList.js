import { memo, useCallback, useMemo } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList, areEqual } from 'react-window';
import CategoryLabel from './CategoryLabel';
import { formatCurrency } from '../utils/formatCurrency';
import { formatIndianDate } from '../utils/indiaDate';

const TYPE_STYLES = {
  income: { color: 'text-emerald-700', prefix: '+' },
  expense: { color: 'text-rose-700', prefix: '-' },
  investment: { color: 'text-indigo-700', prefix: '-' },
};

const ROW_HEIGHT = 120;
const LIST_HEIGHT = 600;

const TransactionRow = memo(function TransactionRow({ index, style, data }) {
  const { expenses, onEdit, onDelete } = data;
  const expense = expenses[index];
  const typeStyle = TYPE_STYLES[expense.type] || TYPE_STYLES.expense;

  const handleEdit = () => {
    onEdit(expense.id);
  };

  const handleDelete = () => {
    onDelete(expense.id);
  };

  return (
    <div style={style} className="pr-1">
      <div className="flex h-[112px] items-start justify-between gap-3 rounded-xl bg-slate-50 p-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{expense.title}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-500">
            <span className="capitalize">{expense.type}</span>
            <span aria-hidden="true">·</span>
            <CategoryLabel category={expense.category} className="text-slate-600" />
            <span aria-hidden="true">·</span>
            <span>{formatIndianDate(expense.date)}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <strong className={`block ${typeStyle.color}`}>
            {typeStyle.prefix}
            {formatCurrency(expense.amount)}
          </strong>
          <button
            type="button"
            className="w-20 rounded-lg bg-indigo-600 px-2.5 py-1 text-center text-xs font-semibold text-white transition hover:bg-indigo-700 active:bg-indigo-800"
            onClick={handleEdit}
          >
            Edit
          </button>
          <button
            type="button"
            className="w-20 rounded-lg bg-rose-600 px-2.5 py-1 text-center text-xs font-semibold text-white transition hover:bg-rose-700 active:bg-rose-800"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}, areEqual);

function ExpenseList({ expenses, onDelete, onEdit }) {
  const itemData = useMemo(
    () => ({ expenses, onEdit, onDelete }),
    [expenses, onDelete, onEdit]
  );

  const itemKey = useCallback((index, data) => data.expenses[index].id, []);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Recent Transactions</h2>
      {expenses.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Start by adding your first transaction.</p>
      ) : (
        <>
          <p className="mt-2 text-xs text-slate-500">{expenses.length} transactions</p>
          <div className="mt-3" style={{ height: LIST_HEIGHT }}>
            <AutoSizer>
              {({ height, width }) => (
                <FixedSizeList
                  height={height}
                  width={width}
                  itemCount={expenses.length}
                  itemSize={ROW_HEIGHT}
                  itemData={itemData}
                  itemKey={itemKey}
                  overscanCount={8}
                >
                  {TransactionRow}
                </FixedSizeList>
              )}
            </AutoSizer>
          </div>
        </>
      )}
    </section>
  );
}

export default memo(ExpenseList);
