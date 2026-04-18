import { NavLink } from 'react-router-dom';
import useExpenseStore from '../store/useExpenseStore';

const navItems = [
  { to: '/', label: 'Overview', end: true },
  { to: '/transactions', label: 'Transactions' },
  { to: '/budgets', label: 'Budgets' },
];

function DashboardNavbar() {
  const theme = useExpenseStore((state) => state.theme);
  const toggleTheme = useExpenseStore((state) => state.toggleTheme);

  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-indigo-100 bg-white px-4 py-3">
      <h1 className="text-lg font-semibold text-slate-900">Expense Dashboard</h1>
      <div className="flex flex-wrap items-center gap-2">
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
        <button
          type="button"
          className={`rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold ${theme === 'dark' ? 'text-indigo-500' : 'text-slate-700'} transition hover:bg-slate-200`}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </nav>
  );
}

export default DashboardNavbar;
