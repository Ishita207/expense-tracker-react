import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardNavbar from '../../components/DashboardNavbar';
import useExpenseStore from '../../store/useExpenseStore';

function DashboardLayout() {
  const theme = useExpenseStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="min-h-screen">
      <DashboardNavbar />
      <Outlet />
    </div>
  );
}

export default DashboardLayout;
