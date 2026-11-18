import { useState, type ReactNode } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  GraduationCap,
  CalendarDays,
  Users,
  ShoppingBag,
  Bell,
  Gift,
  Settings as SettingsIcon,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { useAdmin } from '../store/AdminStore';
import { Toasts } from './ui';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/produkte', label: 'Produkte', icon: Package },
  { to: '/kurse', label: 'Academy-Kurse', icon: GraduationCap },
  { to: '/events', label: 'Live-Events', icon: CalendarDays },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/bestellungen', label: 'Bestellungen', icon: ShoppingBag },
  { to: '/mitteilungen', label: 'Mitteilungen', icon: Bell },
  { to: '/rewards', label: 'Rewards', icon: Gift },
  { to: '/einstellungen', label: 'Einstellungen', icon: SettingsIcon },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { logout, toasts, dismissToast, orders, adminName } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openOrders = orders.filter((o) => o.status === 'bestätigt' || o.status === 'versandt').length;

  return (
    <div className="min-h-screen lg:flex">
      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[240px] transform overflow-y-auto bg-deep-950 transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center gap-2.5 px-2 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-royal-500 to-royal-700 text-[15px] font-extrabold text-white">
              A
            </div>
            <div className="leading-none">
              <p className="text-[15px] font-extrabold tracking-tight text-white">
                GLAM<span className="text-royal-300">LOOX</span>
              </p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-royal-300/70">Admin Console</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} aria-label="Menü schließen" className="tap ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-white/50 lg:hidden">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <nav className="mt-4 flex-1 space-y-1" aria-label="Admin-Navigation">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `tap flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                    isActive ? 'bg-royal-600 text-white shadow-card' : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="h-[17px] w-[17px] shrink-0" aria-hidden />
                <span className="flex-1">{label}</span>
                {to === '/bestellungen' && openOrders > 0 && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">{openOrders}</span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="space-y-1 border-t border-white/10 pt-3">
            <a
              href="https://glamloox-app.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="tap flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-white/60 hover:bg-white/10 hover:text-white"
            >
              <ExternalLink className="h-[17px] w-[17px]" aria-hidden /> Client-App öffnen
            </a>
            <button
              onClick={logout}
              className="tap flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-white/60 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-[17px] w-[17px]" aria-hidden /> Abmelden
            </button>
            <p className="px-3 pb-2 pt-2 text-[10px] leading-relaxed text-white/30">
              Admin-Demo · Daten lokal im Browser
            </p>
          </div>
        </div>
      </aside>

      {/* ── Inhalt ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[60px] items-center gap-3 border-b border-mist-200 bg-white/90 px-4 backdrop-blur-xl lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Menü öffnen"
            className="tap flex h-9 w-9 items-center justify-center rounded-xl border border-mist-200 bg-white text-deep-900 shadow-card lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <p className="flex-1 truncate text-[13px] font-semibold text-slate-400">
            Management Console · <span className="text-deep-900">GLAMLOOX App-Prototyp</span>
          </p>
          <Link
            to="/bestellungen"
            className="tap hidden items-center gap-1.5 rounded-full bg-royal-50 px-3 py-1.5 text-[12px] font-bold text-royal-700 sm:flex"
          >
            {openOrders} offene Bestellungen
          </Link>
          <span className="hidden items-center gap-2 rounded-full border border-mist-200 bg-white px-3 py-1.5 text-[12px] font-bold text-deep-900 shadow-card sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden /> {adminName}
          </span>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-[1200px]">{children}</div>
        </main>
      </div>

      <Toasts toasts={toasts} dismiss={dismissToast} />
    </div>
  );
}
