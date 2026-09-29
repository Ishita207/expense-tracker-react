import { NavLink } from 'react-router-dom';
import useExpenseStore from '../store/useExpenseStore';

const navItems = [
  { to: '/', label: 'Overview', end: true },
  { to: '/transactions', label: 'Transactions' },
  { to: '/budgets', label: 'Budgets' },
];

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z"
      />
    </svg>
  );
}

function DashboardNavbar() {
  const theme = useExpenseStore((state) => state.theme);
  const toggleTheme = useExpenseStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-indigo-100 bg-white px-4 py-3">
      <h1 className="text-lg font-semibold text-slate-900">Expense Dashboard</h1>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-2" role="navigation" aria-label="Dashboard sections">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden h-6 w-px bg-slate-200 sm:block" aria-hidden="true" />

        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </nav>
  );
}

export default DashboardNavbar;
