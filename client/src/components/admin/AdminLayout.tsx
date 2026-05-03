import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';

const AdminLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
