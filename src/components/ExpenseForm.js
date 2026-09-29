import { memo } from 'react';
import { categories, getCategoryMeta } from '../constants/categories';

function ExpenseForm({ formData, onChange, onSubmit, isEditing, onCancelEdit }) {
  return (
    <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
      <label className="grid gap-1 text-sm text-slate-700">
        Title
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={onChange}
          placeholder="Lunch, groceries, electricity bill..."
          required
          className="field-control"
        />
      </label>

      <label className="grid gap-1 text-sm text-slate-700">
        Amount
        <input
          type="number"
          min="1"
          step="1"
          name="amount"
          value={formData.amount}
          onChange={onChange}
          placeholder="0.00"
          required
          className="field-control"
        />
      </label>

      <label className="grid gap-1 text-sm text-slate-700">
        Type
        <select
          name="type"
          value={formData.type}
          onChange={onChange}
          className="field-control"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="investment">Investment</option>
        </select>
      </label>

      <label className="grid gap-1 text-sm text-slate-700">
        Category
        <select
          name="category"
          value={formData.category.name}
          onChange={(event) => onChange({ ...event, target: { ...event.target, name: 'category', value: event.target.value.name } })}
          className="field-control"
        >
          {categories.map((category) => (
            <option key={category.name} value={category.name}>
              {category.name || 'Other'}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-sm text-slate-700">
        Date
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={onChange}
          required
          className="field-control"
        />
      </label>

      {formData.type === 'expense' && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="isRecurring"
            checked={Boolean(formData.isRecurring)}
            onChange={onChange}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Mark as monthly recurring
        </label>
      )}

      <button
        type="submit"
        className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        {isEditing ? 'Update Transaction' : 'Add Transaction'}
      </button>
      {isEditing && (
        <button
          type="button"
          className="rounded-lg bg-indigo-100 px-3 py-2 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-200"
          onClick={onCancelEdit}
        >
          Cancel Edit
        </button>
      )}
    </form>
  );
}

export default memo(ExpenseForm);
