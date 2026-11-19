import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Package,
  GraduationCap,
  CalendarDays,
  Sparkles as SparklesIcon,
  Users,
  ShoppingBag,
  Bell,
  Gift,
  Settings as SettingsIcon,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Keyboard,
  Search,
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

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/produkte': 'Produkte',
  '/kurse': 'Academy-Kurse',
  '/events': 'Live-Events',
  '/aktionen': 'Aktionen',
  '/community': 'Community',
  '/bestellungen': 'Bestellungen',
  '/mitteilungen': 'Mitteilungen',
  '/rewards': 'Rewards',
  '/einstellungen': 'Einstellungen',
};

export default function Layout({ children }: { children: ReactNode }) {
  const { logout, toasts, dismissToast, orders, adminName, products, posts, promotions, members } = useAdmin();
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);

  // A1: Dokumenttitel pro Seite
  useEffect(() => {
    document.title = `${PAGE_TITLES[location.pathname] ?? 'Admin'} · GLAMLOOX Admin`;
  }, [location.pathname]);

  // A3: «?» öffnet Hilfe, «k» fokussiert Suche, Esc schließt
  const [helpOpen, setHelpOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === '?') setHelpOpen((v) => !v);
      if (e.key === 'k') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'Escape') setHelpOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
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
              { group: 'Katalog & Inhalte', items: [nav[1], nav[2], nav[3], { to: '/aktionen', label: 'Aktionen', icon: SparklesIcon }] },
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
                            <span className="ml-auto mr-1 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold text-white">{openOrders}</span>
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
          <GlobalSearch products={products} posts={posts} promotions={promotions} orders={orders} members={members} searchRef={searchRef} />
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

      {/* A3: Tastatur-Hilfe */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-deep-950/50 backdrop-blur-sm" onClick={() => setHelpOpen(false)} aria-hidden />
          <div className="anim-fade-up relative w-full max-w-md rounded-3xl border border-mist-200 bg-white p-5 shadow-float">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-deep-950">
                <Keyboard className="h-[18px] w-[18px] text-royal-600" aria-hidden /> Tastatur-Kürzel
              </h2>
              <button onClick={() => setHelpOpen(false)} aria-label="Hilfe schließen" className="tap flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-mist-100">
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="space-y-2">
              {[
                ['k', 'Globale Suche fokussieren'],
                ['?', 'Diese Hilfe anzeigen'],
                ['Esc', 'Dialoge schließen'],
                ['Enter', 'Formulare absenden'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between rounded-xl bg-mist-50 px-4 py-2.5">
                  <span className="text-[13px] font-semibold text-slate-600">{desc}</span>
                  <kbd className="rounded-lg border border-mist-200 bg-white px-2.5 py-1 font-mono text-[12px] font-bold text-deep-900 shadow-card">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <Toasts toasts={toasts} dismiss={dismissToast} />
    </div>
  );
}


// A2: Globale Suche über alle Entitäten
function GlobalSearch({ products, posts, promotions, orders, members, searchRef }: {
  products: { id: string; shortTitle: string; vendor: string }[];
  posts: { id: string; title?: string; text: string }[];
  promotions: { id: string; name: string }[];
  orders: { id: string; customer: string }[];
  members: { id: string; name: string }[];
  searchRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const query = q.trim().toLowerCase();
  const hits = useMemo(() => {
    if (!query) return [];
    const out: { label: string; sub: string; to: string; group: string }[] = [];
    products.filter((p) => p.shortTitle.toLowerCase().includes(query) || p.vendor.toLowerCase().includes(query)).slice(0, 3)
      .forEach((p) => out.push({ label: p.shortTitle, sub: p.vendor + ' · Produkt', to: '/produkte', group: 'Produkte' }));
    promotions.filter((p) => p.name.toLowerCase().includes(query)).slice(0, 2)
      .forEach((p) => out.push({ label: p.name, sub: 'Aktion', to: '/aktionen', group: 'Aktionen' }));
    orders.filter((o) => o.id.toLowerCase().includes(query) || o.customer.toLowerCase().includes(query)).slice(0, 2)
      .forEach((o) => out.push({ label: o.id + ' · ' + o.customer, sub: 'Bestellung', to: '/bestellungen', group: 'Bestellungen' }));
    posts.filter((p) => (p.title ?? p.text).toLowerCase().includes(query)).slice(0, 2)
      .forEach((p) => out.push({ label: (p.title ?? p.text).slice(0, 42) + '…', sub: 'Beitrag', to: '/community', group: 'Community' }));
    members.filter((m) => m.name.toLowerCase().includes(query)).slice(0, 2)
      .forEach((m) => out.push({ label: m.name, sub: 'Mitglied', to: '/community', group: 'Community' }));
    return out.slice(0, 8);
  }, [query, products, posts, promotions, orders, members]);

  return (
    <div className="relative min-w-0 flex-1">
      <div className="flex h-9 max-w-[420px] items-center gap-2 rounded-xl border border-mist-200 bg-mist-50 px-3 focus-within:border-royal-400 focus-within:bg-white">
        <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        <input
          ref={searchRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && hits[0]) { navigate(hits[0].to); setOpen(false); setQ(''); }
            if (e.key === 'Escape') { setQ(''); setOpen(false); }
          }}
          placeholder="Alles durchsuchen … (k)"
          aria-label="Admin-Globalsuche"
          className="h-full w-full bg-transparent text-[13px] font-medium outline-none placeholder:text-slate-400"
        />
        <kbd className="hidden rounded border border-mist-200 bg-white px-1.5 text-[10px] font-bold text-slate-400 sm:block">k</kbd>
      </div>
      {open && query && (
        <div className="absolute left-0 top-11 z-50 w-[420px] max-w-[85vw] overflow-hidden rounded-2xl border border-mist-200 bg-white shadow-float">
          {hits.length === 0 ? (
            <p className="px-4 py-4 text-[12.5px] text-slate-400">Nichts gefunden für „{q}“</p>
          ) : (
            hits.map((h, i) => (
              <button
                key={i}
                onMouseDown={() => { navigate(h.to); setQ(''); setOpen(false); }}
                className="flex w-full items-center gap-3 border-b border-mist-100 px-4 py-2.5 text-left last:border-0 hover:bg-mist-50"
              >
                <span className="w-20 shrink-0 text-[10px] font-bold uppercase tracking-wide text-royal-600">{h.group}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-deep-900">{h.label}</span>
                  <span className="block truncate text-[11px] text-slate-400">{h.sub}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
