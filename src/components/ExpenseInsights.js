import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';
import { formatIndianDate, formatIndianMonth } from '../utils/indiaDate';
import useExpenseStore from '../store/useExpenseStore';

const donutColors = ['#3459db', '#6d8bff', '#8f6aff', '#37a2ff', '#27c1b3', '#ff7a8f'];
const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function ExpenseInsights({ expenses, selectedMonth, onMonthChange }) {
  const navigate = useNavigate();
  const theme = useExpenseStore((state) => state.theme);
  console.log(theme);
  const monthlyOutflowTotals = getMonthlyOutflowCategoryTotals(expenses, selectedMonth);

  const donutData = Object.entries(monthlyOutflowTotals)
    .map(([category, amount]) => ({
      name: category,
      value: Number(amount.toFixed(2)),
    }))
    .filter((entry) => entry.value > 0)
    .sort((first, second) => second.value - first.value);

  const monthlyTrendData = getLastSixMonthsSpending(expenses, selectedMonth);
  const heatmap = getMonthHeatmap(expenses, selectedMonth);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Insights</h2>
      <p className="mt-1 text-sm text-slate-500">Visual breakdowns to understand spending behavior.</p>
      <label className="mt-3 inline-grid gap-1 text-sm text-slate-700">
        Insights month
        <input
          type="month"
          value={selectedMonth}
          onChange={(event) => onMonthChange(event.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </label>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <article className="rounded-xl bg-slate-50 p-3">
          <h3 className="text-sm font-semibold text-slate-800">
            Category Donut ({formatIndianMonth(selectedMonth)})
          </h3>
          {donutData.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No expense data for this month yet.</p>
          ) : (
            <div className="mt-2 grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px] sm:items-center">
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={entry.name} fill={donutColors[index % donutColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="grid gap-2 text-xs text-slate-700">
                {donutData.map((entry, index) => (
                  <li key={entry.name} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: donutColors[index % donutColors.length] }}
                      />
                      {entry.name}
                    </span>
                    <strong>{formatCurrency(entry.value)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        <article className="rounded-xl bg-slate-50 p-3">
          <h3 className="text-sm font-semibold text-slate-800">Monthly Trend (Last 6 Months)</h3>
          <div className="mt-2 h-60 w-full">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyTrendData}>
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="amount" fill="#3459db" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <article className="mt-3 rounded-xl bg-slate-50 p-3">
        <h3 className="text-sm font-semibold text-slate-800">
          Spending Heatmap by Weekday ({formatIndianMonth(selectedMonth)})
        </h3>
        <div className="mt-2">
          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
            {weekdayLabels.map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {heatmap.map((week, weekIndex) =>
              week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`grid aspect-square place-items-center rounded-md text-[16px] ${theme === 'dark' ? 'text-indigo-500' : 'text-slate-700'} transition hover:ring-2 hover:ring-indigo-300`}
                  title={getHeatmapDayTitle(day)}
                  style={{ backgroundColor: getHeatmapColor(day.intensity) }}
                  role={day.date ? 'button' : undefined}
                  tabIndex={day.date ? 0 : -1}
                  onClick={() => {
                    if (!day.date) {
                      return;
                    }
                    navigate(`/transactions?dateFrom=${day.date}&dateTo=${day.date}`);
                  }}
                  onKeyDown={(event) => {
                    if (!day.date || (event.key !== 'Enter' && event.key !== ' ')) {
                      return;
                    }
                    event.preventDefault();
                    navigate(`/transactions?dateFrom=${day.date}&dateTo=${day.date}`);
                  }}
                >
                  {day.date ? day.date.split('-')[2] : ''}
                </div>
              ))
            )}
          </div>
        </div>
      </article>
    </section>
  );
}

function getLastSixMonthsSpending(expenses, selectedMonth) {
  const monthKeys = getLastNMonthKeys(6, selectedMonth);

  const totalsByMonth = monthKeys.reduce((accumulator, key) => {
    return { ...accumulator, [key]: 0 };
  }, {});

  expenses.forEach((transaction) => {
    if (!isOutflow(transaction.type)) {
      return;
    }
    const monthKey = transaction.date.slice(0, 7);
    if (totalsByMonth[monthKey] === undefined) {
      return;
    }
    totalsByMonth[monthKey] += transaction.amount;
  });

  return monthKeys.map((monthKey) => ({
    month: new Intl.DateTimeFormat('en-IN', { month: 'short', year: '2-digit' }).format(
      new Date(`${monthKey}-01T00:00:00+05:30`)
    ),
    amount: Number(totalsByMonth[monthKey].toFixed(2)),
  }));
}

function getLastNMonthKeys(count, latestMonthIso) {
  const [baseYear, baseMonth] = latestMonthIso.split('-').map(Number);
  const keys = [];

  for (let index = count - 1; index >= 0; index -= 1) {
    const monthIndex = baseMonth - 1 - index;
    const date = new Date(baseYear, monthIndex, 1);
    keys.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }

  return keys;
}

function getMonthHeatmap(expenses, selectedMonth) {
  const [year, month] = selectedMonth.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();

  const totalsByDate = {};
  expenses.forEach((transaction) => {
    if (isOutflow(transaction.type) && transaction.date.startsWith(selectedMonth)) {
      const existing = totalsByDate[transaction.date] || {
        amount: 0,
        count: 0,
        categoryTotals: {},
      };
      totalsByDate[transaction.date] = {
        amount: existing.amount + transaction.amount,
        count: existing.count + 1,
        categoryTotals: {
          ...existing.categoryTotals,
          [transaction.category]:
            (existing.categoryTotals[transaction.category] || 0) + transaction.amount,
        },
      };
    }
  });

  const maxSpend = Math.max(
    ...Object.values(totalsByDate).map((day) => day.amount),
    0
  );
  const weeks = [];
  let week = Array(7)
    .fill(null)
    .map(() => ({ amount: 0, intensity: 0, date: null, count: 0, categoryTotals: {} }));

  for (let dayOffset = 0; dayOffset < firstDay.getDay(); dayOffset += 1) {
    week[dayOffset] = { amount: 0, intensity: 0, date: null, count: 0, categoryTotals: {} };
  }

  for (let dateNumber = 1; dateNumber <= lastDate; dateNumber += 1) {
    const currentDate = new Date(year, month - 1, dateNumber);
    const dateString = `${selectedMonth}-${String(dateNumber).padStart(2, '0')}`;
    const dayData = totalsByDate[dateString] || { amount: 0, count: 0, categoryTotals: {} };
    const amount = dayData.amount;
    const intensity = maxSpend > 0 ? amount / maxSpend : 0;

    week[currentDate.getDay()] = {
      amount,
      intensity,
      date: dateString,
      count: dayData.count,
      categoryTotals: dayData.categoryTotals,
    };

    if (currentDate.getDay() === 6 || dateNumber === lastDate) {
      weeks.push(week);
      week = Array(7)
        .fill(null)
        .map(() => ({ amount: 0, intensity: 0, date: null, count: 0, categoryTotals: {} }));
    }
  }

  return weeks;
}

function getHeatmapDayTitle(day) {
  if (!day.date) {
    return 'No date';
  }

  const topCategories = Object.entries(day.categoryTotals || {})
    .sort((first, second) => second[1] - first[1])
    .slice(0, 2)
    .map(([category, amount]) => `${category}: ${formatCurrency(amount)}`)
    .join(', ');

  const categoryText = topCategories ? ` | Top: ${topCategories}` : '';
  return `${formatIndianDate(day.date)} | ${formatCurrency(day.amount)} | ${day.count} entr${
    day.count === 1 ? 'y' : 'ies'
  }${categoryText}`;
}

function getMonthlyOutflowCategoryTotals(expenses, selectedMonth) {
  return expenses.reduce((accumulator, transaction) => {
    if (!isOutflow(transaction.type) || !transaction.date.startsWith(selectedMonth)) {
      return accumulator;
    }

    const previousAmount = accumulator[transaction.category] || 0;
    return {
      ...accumulator,
      [transaction.category]: previousAmount + transaction.amount,
    };
  }, {});
}

function isOutflow(type) {
  return type === 'expense' || type === 'investment';
}

function getHeatmapColor(intensity) {
  if (intensity === 0) {
    return '#edf1ff';
  }
  if (intensity < 0.25) {
    return '#d4ddff';
  }
  if (intensity < 0.5) {
    return '#a6b9ff';
  }
  if (intensity < 0.75) {
    return '#6d8bff';
  }
  return '#3459db';
}

export default ExpenseInsights;
