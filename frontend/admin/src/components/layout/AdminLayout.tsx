import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiCalendar, FiFileText, FiAward, FiUsers, FiImage, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
  { icon: FiCalendar, label: 'Eventos', path: '/dashboard/events' },
  { icon: FiFileText, label: 'Blog', path: '/dashboard/blog' },
  { icon: FiAward, label: 'Insignias', path: '/dashboard/badges' },
  { icon: FiUsers, label: 'Miembros', path: '/dashboard/members' },
  { icon: FiImage, label: 'Media', path: '/dashboard/media' },
  { icon: FiSettings, label: 'Configuración', path: '/dashboard/settings' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-dark text-cream fixed inset-y-0 z-30">
        <div className="p-6 border-b border-gold/20">
          <h1 className="font-display text-3xl text-gold tracking-wider">REDES</h1>
          <p className="text-silver text-xs mt-1">Panel de Administración</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gold/20 text-gold'
                    : 'text-silver hover:text-cream hover:bg-dark-lighter'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gold/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
              <span className="text-gold text-sm font-bold">
                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cream truncate">
                {user?.firstName || user?.username}
              </p>
              <p className="text-xs text-silver truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-silver hover:text-red-400 transition-colors"
          >
            <FiLogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-dark text-cream z-50 transform transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gold/20">
          <h1 className="font-display text-2xl text-gold tracking-wider">REDES</h1>
          <button onClick={() => setSidebarOpen(false)} className="text-cream">
            <FiX size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-gold/20 text-gold'
                  : 'text-silver hover:text-cream'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gold/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-silver hover:text-red-400"
          >
            <FiLogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600"
            >
              <FiMenu size={24} />
            </button>
            <h2 className="font-heading text-lg font-semibold text-gray-800">
              {navItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
            <div className="flex items-center gap-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-gold transition-colors"
              >
                Ver sitio
              </a>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
