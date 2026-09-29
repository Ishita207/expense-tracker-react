import { memo, useCallback, useMemo } from 'react';
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
import { getCategoryColor, getCategoryMeta } from '../constants/categories';
import { formatCurrency } from '../utils/formatCurrency';
import { formatIndianDate, formatIndianMonth } from '../utils/indiaDate';

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CategoryDonutCard = memo(function CategoryDonutCard({ selectedMonth, donutData, formatTooltip }) {
  return (
    <article className="rounded-xl bg-slate-50 p-3">
      <h3 className="text-sm font-semibold text-slate-800">
        Category Donut ({formatIndianMonth(selectedMonth)})
      </h3>
      {donutData.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No expense data for this month yet.</p>
      ) : (
        <div className="mt-2 flex flex-row gap-1 sm:grid-cols-[minmax(0,1fr)_160px] sm:items-center">
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="Total Expense"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={getCategoryColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip formatter={formatTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="grid gap-3 text-s text-slate-700">
            {donutData.map((entry) => {
              const meta = getCategoryMeta(entry.name);
              const Icon = meta.icon;
              return (
                <li key={entry.name} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-[11px] leading-none"
                      style={{color: meta.color, fontSize: '18px' }}
                      aria-hidden="true"
                    >
                      <Icon size={22} weight="duotone" />
                    </span>
                    {entry.name}
                  </span>
                  <strong>{formatCurrency(entry.value)}</strong>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </article>
  );
});

const MonthlyTrendCard = memo(function MonthlyTrendCard({ monthlyTrendData, formatTooltip }) {
  return (
    <article className="rounded-xl bg-slate-50 p-3">
      <h3 className="text-sm font-semibold text-slate-800">Monthly Trend (Last 6 Months)</h3>
      <div className="mt-2 h-60 w-full">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyTrendData}>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
            <Tooltip formatter={formatTooltip} />
            <Bar dataKey="amount" fill="#3459db" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
});

const HeatmapDay = memo(function HeatmapDay({ day, onSelectDate }) {
  const handleClick = useCallback(() => {
    if (!day.date) {
      return;
    }
    onSelectDate(day.date);
  }, [day.date, onSelectDate]);

  const handleKeyDown = useCallback(
    (event) => {
      if (!day.date || (event.key !== 'Enter' && event.key !== ' ')) {
        return;
      }
      event.preventDefault();
      onSelectDate(day.date);
    },
    [day.date, onSelectDate]
  );

  return (
    <div
      className={`grid aspect-square place-items-center rounded-md text-[18px] ${
        day.intensity >= 0.55 ? 'text-white' : 'text-slate-600'
      } transition hover:ring-2 hover:ring-indigo-300`}
      title={getHeatmapDayTitle(day)}
      style={{ backgroundColor: getHeatmapColor(day.intensity) }}
      role={day.date ? 'button' : undefined}
      tabIndex={day.date ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {day.date ? day.date.split('-')[2] : ''}
    </div>
  );
});

const SpendingHeatmapCard = memo(function SpendingHeatmapCard({
  selectedMonth,
  heatmap,
  onSelectDate,
}) {
  return (
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
              <HeatmapDay
                key={`${weekIndex}-${dayIndex}`}
                day={day}
                onSelectDate={onSelectDate}
              />
            ))
          )}
        </div>
        <div className="mt-3 flex items-center justify-end gap-2 text-xs text-slate-500">
          <span>less</span>
          <div
            className="h-2.5 w-28 overflow-hidden rounded-full"
            style={{
              background: `linear-gradient(to right, ${getHeatmapColor(0)}, ${getHeatmapColor(0.35)}, ${getHeatmapColor(0.7)}, ${getHeatmapColor(1)})`,
            }}
            aria-hidden="true"
          />
          <span>more</span>
        </div>
      </div>
    </article>
  );
});

function ExpenseInsights({ expenses, selectedMonth, onMonthChange }) {
  const navigate = useNavigate();

  const donutData = useMemo(() => {
    const monthlyOutflowTotals = getMonthlyOutflowCategoryTotals(expenses, selectedMonth);
    return Object.entries(monthlyOutflowTotals)
      .map(([category, amount]) => ({
        name: category,
        value: Number(amount.toFixed(2)),
      }))
      .filter((entry) => entry.value > 0)
      .sort((first, second) => second.value - first.value);
  }, [expenses, selectedMonth]);

  const monthlyTrendData = useMemo(
    () => getLastSixMonthsSpending(expenses, selectedMonth),
    [expenses, selectedMonth]
  );

  const heatmap = useMemo(
    () => getMonthHeatmap(expenses, selectedMonth),
    [expenses, selectedMonth]
  );

  const formatTooltip = useCallback((value) => formatCurrency(Number(value)), []);

  const handleSelectDate = useCallback(
    (date) => {
      navigate(`/transactions?dateFrom=${date}&dateTo=${date}`);
    },
    [navigate]
  );

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
          className="field-control"
        />
      </label>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <CategoryDonutCard
          selectedMonth={selectedMonth}
          donutData={donutData}
          formatTooltip={formatTooltip}
        />
        <MonthlyTrendCard monthlyTrendData={monthlyTrendData} formatTooltip={formatTooltip} />
      </div>

      <SpendingHeatmapCard
        selectedMonth={selectedMonth}
        heatmap={heatmap}
        onSelectDate={handleSelectDate}
      />
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

  const maxSpend = Math.max(...Object.values(totalsByDate).map((day) => day.amount), 0);
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
    .map(([category, amount]) => `${getCategoryMeta(category).name}: ${formatCurrency(amount)}`)
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
  const t = Math.min(Math.max(intensity || 0, 0), 1);

  // Near-white → soft indigo → deep indigo/purple for relative spend.
  const stops = [
    { t: 0, color: [248, 250, 252] }, // #f8fafc
    { t: 0.25, color: [199, 210, 254] }, // #c7d2fe
    { t: 0.5, color: [129, 140, 248] }, // #818cf8
    { t: 0.75, color: [79, 70, 229] }, // #4f46e5
    { t: 1, color: [49, 46, 129] }, // #312e81
  ];

  let start = stops[0];
  let end = stops[stops.length - 1];
  for (let index = 0; index < stops.length - 1; index += 1) {
    if (t >= stops[index].t && t <= stops[index + 1].t) {
      start = stops[index];
      end = stops[index + 1];
      break;
    }
  }

  const range = end.t - start.t || 1;
  const localT = (t - start.t) / range;
  const r = Math.round(start.color[0] + (end.color[0] - start.color[0]) * localT);
  const g = Math.round(start.color[1] + (end.color[1] - start.color[1]) * localT);
  const b = Math.round(start.color[2] + (end.color[2] - start.color[2]) * localT);

  return `rgb(${r}, ${g}, ${b})`;
}

export default memo(ExpenseInsights);
