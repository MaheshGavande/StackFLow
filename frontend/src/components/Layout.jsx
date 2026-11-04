import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../Auth.jsx';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/products', label: 'Products' },
  { to: '/settings', label: 'Settings' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen md:flex">
      <aside className="relative border-b border-line bg-white md:min-h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-4 md:block">
          <div>
            <p className="text-lg font-semibold tracking-tight text-brand">StockFlow</p>
            <p className="mt-0.5 truncate text-sm text-muted">{user.organizationName}</p>
          </div>
        </div>
        <nav className="flex gap-1 px-3 pb-3 md:flex-col md:pb-0">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand text-white' : 'text-ink hover:bg-paper'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-5 py-4 md:absolute md:bottom-0 md:block md:w-60">
          <p className="truncate text-xs text-muted">{user.email}</p>
          <button onClick={logout} className="mt-1 text-sm font-medium text-ink underline-offset-2 hover:underline">
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 px-5 py-8 md:px-10">
        <div className="mx-auto max-w-5xl"><Outlet /></div>
        <button onClick={logout} className="mt-10 text-sm text-muted underline md:hidden">Log out</button>
      </main>
    </div>
  );
}