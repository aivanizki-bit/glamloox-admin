import { useState, type ReactNode } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
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
        className={`fixed inset-y-0 left-0 z-40 w-[250px] transform overflow-y-auto transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(170deg, #061238 0%, #0A1E5A 45%, #14267A 100%)',
          boxShadow: '20px 0 60px -30px rgba(6, 18, 56, 0.5)',
        }}
      >
        {/* Декоративное свечение как в App-Hero */}
        <div
          className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #4C6EF5, transparent 70%)' }}
          aria-hidden
        />
        <div className="relative flex h-full flex-col p-4">
          {/* Бренд-шапка с ®-маркой */}
          <div className="flex items-center gap-2.5 px-2 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-royal-400 to-royal-700 text-[17px] font-extrabold text-white shadow-float">
              A
            </div>
            <div className="leading-none">
              <p className="text-[16px] font-extrabold tracking-tight text-white">
                GLAM<span className="text-royal-300">LOOX</span>
                <span className="ml-0.5 align-super text-[8px] font-bold text-royal-300">®</span>
              </p>
              <p className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.24em] text-royal-300/70">Admin Console</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} aria-label="Menü schließen" className="tap ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-white/50 lg:hidden">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          {/* Секции навигации с бренд-подписями */}
          <nav className="mt-4 flex-1 space-y-6" aria-label="Admin-Navigation">
            {[
              { group: 'Übersicht', items: [nav[0]] },
              { group: 'Katalog & Inhalte', items: [nav[1], nav[2], nav[3]] },
              { group: 'Community & Order', items: [nav[4], nav[5]] },
              { group: 'System', items: [nav[6], nav[7], nav[8]] },
            ].map(({ group, items }) => (
              <div key={group}>
                <p className="px-3 pb-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.22em] text-royal-300/50">{group}</p>
                <div className="space-y-1">
                  {items.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/'}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `tap relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-royal-500 to-royal-700 text-white shadow-float'
                            : 'text-white/55 hover:bg-white/10 hover:text-white'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute -left-4 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-royal-300" aria-hidden />
                          )}
                          <Icon className="h-[17px] w-[17px] shrink-0" aria-hidden />
                          <span className="flex-1">{label}</span>
                          {to === '/bestellungen' && openOrders > 0 && (
                            <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold text-white">{openOrders}</span>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
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
            {/* Проход 5: бренд-карточка версии */}
            <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-3.5">
              <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-royal-300">
                <Sparkles className="h-3.5 w-3.5" aria-hidden /> Natürlich. Sicher. Einfach du.
              </p>
              <p className="mt-1 text-[9.5px] leading-relaxed text-white/35">
                Admin-Demo v2.1 · Daten lokal im Browser
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Inhalt ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[60px] items-center gap-3 border-b border-mist-200 bg-white/85 px-4 backdrop-blur-xl lg:px-8"
          style={{ boxShadow: '0 1px 0 rgba(46, 91, 240, 0.06)' }}>
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
          {/* Проход 5: бренд-футер */}
          <footer className="mx-auto mt-8 max-w-[1200px] pb-6 text-center">
            <p className="text-[10.5px] font-semibold tracking-wide text-slate-300">
              GLAMLOOX<span className="align-super text-[8px]">®</span> Admin Console · Interactive Concept Demo ·{' '}
              <a href="https://glamloox.net" target="_blank" rel="noreferrer" className="underline hover:text-royal-500">
                glamloox.net
              </a>
            </p>
          </footer>
        </main>
      </div>

      <Toasts toasts={toasts} dismiss={dismissToast} />
    </div>
  );
}
