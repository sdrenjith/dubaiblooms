import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiFileText, FiFolder, FiSettings, FiLogOut, FiExternalLink } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
  { label: 'Dashboard', path: '/admin', icon: FiHome },
  { label: 'Articles', path: '/admin/articles', icon: FiFileText },
  { label: 'Categories', path: '/admin/categories', icon: FiFolder },
  { label: 'Settings', path: '/admin/settings', icon: FiSettings },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-light border-r border-border
      flex-col hidden lg:flex z-40">
      <div className="p-6 border-b border-border">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
            <span className="text-white font-heading font-bold text-lg">B</span>
          </div>
          <div>
            <span className="font-heading font-bold text-text-primary block leading-tight">Dubai Blooms</span>
            <span className="text-[10px] text-text-muted uppercase tracking-widest">Admin Panel</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-300
                ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-border">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
              text-text-muted hover:text-text-primary hover:bg-white/5 transition-all duration-300"
          >
            <FiExternalLink size={18} />
            View Site
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-surface-card border border-border flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm
            text-red-400 hover:bg-red-500/10 transition-all duration-300 cursor-pointer"
        >
          <FiLogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
