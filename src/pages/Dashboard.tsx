import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  GraduationCap,
  Users,
  Euro,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  Radio,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { useAdmin, eur, statusColor } from '../store/AdminStore';
import { Card, Stat, Badge, Button } from '../components/ui';

export default function Dashboard() {
  const { products, courses, events, posts, members, orders, outbox, adminName, rewardPoints, punkteRegeln } = useAdmin();
  const [refreshAt, setRefreshAt] = useState(() => new Date());

  const revenue = orders.filter((o) => o.status !== 'storniert').reduce((n, o) => n + o.total, 0);
  const enrollments = courses.reduce((n, c) => n + c.enrollments, 0);
  const lowStock = products.filter((p) => p.active && p.stock < 15);
  const openOrders = orders.filter((o) => o.status === 'bestätigt' || o.status === 'versandt');
  const inactive = products.filter((p) => !p.active).length;
  const hiddenPosts = posts.filter((p) => p.hidden).length;
  const avgOrder = orders.length > 0 ? revenue / orders.filter((o) => o.status !== 'storniert').length : 0;
  const stornoRate = orders.length > 0 ? Math.round((orders.filter((o) => o.status === 'storniert').length / orders.length) * 100) : 0;
  const topPost = [...posts].sort((a, b) => b.likes - a.likes)[0];
  const topAuthor = members.find((m) => m.id === topPost?.authorId);
  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';

  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov'];
  const counts = [9, 14, 11, 17, 21, orders.filter((o) => o.dateISO.startsWith('2026-11')).length + 8];
  const maxCount = Math.max(...counts);

  const kpis = [
    { icon: <Euro className="h-5 w-5" aria-hidden />, label: 'Demo-Umsatz', value: eur(revenue), hint: 'ohne storniert', tone: 'royal' as const, delta: '+23 %', up: true, spark: [12, 18, 15, 22, 26, 31] },
    { icon: <ShoppingBag className="h-5 w-5" aria-hidden />, label: 'Bestellungen', value: orders.length.toString(), hint: `${openOrders.length} offen · Ø ${eur(avgOrder)}`, tone: 'emerald' as const, delta: '+8', up: true, spark: [9, 14, 11, 17, 21, 24] },
    { icon: <GraduationCap className="h-5 w-5" aria-hidden />, label: 'Einschreibungen', value: enrollments.toLocaleString('de-DE'), hint: `${courses.length} Kurse`, tone: 'royal' as const, delta: '+4,2 %', up: true, spark: [820, 900, 980, 1100, 1240, 1310] },
    { icon: <Users className="h-5 w-5" aria-hidden />, label: 'Community', value: members.length.toString(), hint: `${posts.length} Beiträge · ${stornoRate} % Storno`, tone: 'gold' as const, delta: '−2', up: false, spark: [5, 6, 8, 7, 9, 10] },
  ];

  const quickActions = [
    { to: '/aktionen', label: 'Aktion starten', icon: Sparkles },
    { to: '/produkte', label: 'Produkt anlegen', icon: Package },
    { to: '/events', label: 'Event anlegen', icon: Radio },
    { to: '/mitteilungen', label: 'Mitteilung senden', icon: Radio },
    { to: '/bestellungen', label: 'Status pflegen', icon: ShoppingBag },
  ];

  const catCounts = ['lash-lifting', 'brow', 'pflege', 'zubehoer'].map((c) => ({
    cat: c,
    n: products.filter((p) => p.category === c).length,
  }));
  const maxCat = Math.max(...catCounts.map((c) => c.n));

  const activities = [
    ...orders.slice(0, 3).map((o) => ({ icon: ShoppingBag, text: `Bestellung ${o.id} (${o.status})`, time: o.dateISO })),
    ...outbox.slice(0, 2).map((n) => ({ icon: Radio, text: `Mitteilung „${n.title}“ gesendet`, time: n.sentISO })),
  ];

  return (
    <div className="anim-fade-up">
      {/* Проход 8: бренд-Hero как в App */}
      <div className="relative mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-deep-950 via-deep-900 to-royal-800 px-6 py-6 shadow-float">
        <div
          className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full opacity-30 blur-2xl"
          style={{ background: 'radial-gradient(circle, #7A96F8, transparent 70%)' }}
          aria-hidden
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-royal-300">
              GLAMLOOX Admin · {greeting}, {adminName}
            </p>
            <h1 className="mt-1.5 text-[26px] font-extrabold tracking-tight text-white">
              Dein Prototyp auf einen Blick
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Ohne Hormone', 'Vegan', 'Tierversuchsfrei'].map((u) => (
                <span key={u} className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur">
                  💙 {u}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-wide text-royal-300">Demo-Punkte</p>
              <p className="text-[20px] font-extrabold tabular-nums text-white">{rewardPoints}</p>
            </div>
            <Button variant="ghost" onClick={() => setRefreshAt(new Date())} className="!border-white/25 !bg-white/10 !text-white hover:!bg-white/20">
              <RefreshCw className="h-4 w-4" aria-hidden /> Aktualisieren
            </Button>
          </div>
        </div>
        <p className="relative mt-3 text-[10.5px] text-white/40">
          Stand {refreshAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr · Regeln:{' '}
          {punkteRegeln.euroProPunkt} € = 1 P. · +{punkteRegeln.bonusOrder} P. je Bestellung
        </p>
      </div>

      {/* KPIs mit Trend-Delta */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ icon, label, value, hint, tone }) => (
          <Stat
            key={label}
            icon={icon}
            label={label}
            value={value}
            hint={hint}
            tone={tone}
          />
        ))}
      </div>

      {/* Trend-Zeile */}
      <div className="mt-3 flex flex-wrap gap-2">
        {kpis.map((k) => (
          <Badge key={k.label} className={k.up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500'}>
            <TrendingUp className={`mr-1 h-3 w-3 ${k.up ? '' : 'rotate-180'}`} aria-hidden /> {k.label}: {k.delta}
          </Badge>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {quickActions.map(({ to, label, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="tap flex items-center gap-2.5 rounded-2xl border border-mist-200 bg-white px-4 py-3 text-[13px] font-bold text-deep-900 shadow-card hover:border-royal-200"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-royal-50 text-royal-600">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            {label}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Chart */}
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-deep-900">Bestellungen pro Monat</h2>
            <Badge className="bg-royal-50 text-royal-700">
              <TrendingUp className="mr-1 h-3 w-3" aria-hidden /> +23 % vs. Vormonat
            </Badge>
          </div>
          <div className="mt-5 flex h-[150px] items-end gap-3">
            {months.map((m, i) => (
              <div key={m} className="group flex flex-1 flex-col items-center gap-1.5" title={`${counts[i]} Bestellungen im ${m}`}>
                <span className="text-[11px] font-bold text-deep-900 tabular-nums">{counts[i]}</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-royal-600 to-royal-400 transition-all group-hover:from-royal-700"
                  style={{ height: `${(counts[i] / maxCount) * 110}px` }}
                  aria-hidden
                />
                <span className="text-[11px] font-semibold text-slate-400">{m}</span>
              </div>
            ))}
          </div>

          {/* Top-Kategorien */}
          <h3 className="mt-6 text-[13px] font-bold text-deep-900">Produkte je Kategorie</h3>
          <div className="mt-3 space-y-2">
            {catCounts.map(({ cat, n }) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-[11.5px] font-semibold capitalize text-slate-500">{cat.replace('-', ' ')}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-mist-100">
                  <div className="h-full rounded-full bg-royal-500" style={{ width: `${(n / maxCat) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-[11.5px] font-bold tabular-nums text-deep-900">{n}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10.5px] text-slate-400">Demo-Daten zur Veranschaulichung des Dashboards.</p>
        </Card>

        {/* Handlungsbedarf + System */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-bold text-deep-900">
              <AlertTriangle className="h-[18px] w-[18px] text-amber-500" aria-hidden /> Handlungsbedarf
            </h2>
            <div className="mt-4 space-y-2.5">
              {[
                { to: '/bestellungen', label: `${openOrders.length} offene Bestellungen`, tone: openOrders.length > 0 },
                { to: '/produkte', label: `${lowStock.length} Produkte mit Bestand < 15`, tone: lowStock.length > 0 },
                { to: '/produkte', label: `${inactive} inaktive Produkte`, tone: inactive > 0 },
                { to: '/community', label: `${hiddenPosts} versteckte Beiträge prüfen`, tone: hiddenPosts > 0 },
                { to: '/events', label: `${events.filter((e) => e.published).length} aktive Events`, tone: false },
              ].map(({ to, label, tone }) => (
                <Link
                  key={label}
                  to={to}
                  className={`tap flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[12.5px] font-semibold ${
                    tone ? 'bg-amber-50 text-amber-800' : 'bg-mist-50 text-slate-500'
                  }`}
                >
                  {label}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              ))}
            </div>
          </Card>

          {/* System-Status */}
          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-bold text-deep-900">
              <ShieldCheck className="h-[18px] w-[18px] text-emerald-500" aria-hidden /> System-Status
            </h2>
            <div className="mt-3 space-y-2">
              {[
                ['Client-App', 'https://glamloox-app.vercel.app'],
                ['Admin-Konsole', 'https://glamloox-admin.vercel.app'],
                ['Bild-CDN (Shopify)', 'https://cdn.shopify.com'],
              ].map(([name, url]) => (
                <div key={name} className="flex items-center justify-between rounded-xl bg-mist-50 px-3.5 py-2.5">
                  <a href={url} target="_blank" rel="noreferrer" className="text-[12.5px] font-semibold text-deep-900 hover:text-royal-700">
                    {name}
                  </a>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden /> Online
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Letzte Bestellungen */}
        <Card className="overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between border-b border-mist-200 px-5 py-3.5">
            <h2 className="text-[15px] font-bold text-deep-900">Letzte Bestellungen</h2>
            <Link to="/bestellungen" className="text-[12.5px] font-bold text-royal-700">
              Alle →
            </Link>
          </div>
          <div className="divide-y divide-mist-100">
            {orders.slice(0, 5).map((o) => (
              <Link key={o.id} to="/bestellungen" className="tap flex items-center gap-3 px-5 py-3 hover:bg-mist-50">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-deep-900">{o.id} · {o.customer}</p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(o.dateISO + 'T12:00').toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })} ·{' '}
                    {o.items.reduce((n, it) => n + it.qty, 0)} Artikel
                  </p>
                </div>
                <span className="text-[13px] font-extrabold tabular-nums text-deep-950">{eur(o.total)}</span>
                <Badge className={statusColor[o.status]}>{o.status}</Badge>
              </Link>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          {/* Top-Beitrag */}
          {topPost && (
            <Card className="p-5">
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-deep-900">
                <Activity className="h-[18px] w-[18px] text-royal-600" aria-hidden /> Top-Beitrag der Woche
              </h2>
              <p className="mt-2 line-clamp-2 text-[13px] font-bold text-deep-900">{topPost.title ?? topPost.text}</p>
              <p className="mt-1 text-[11.5px] text-slate-400">
                {topAuthor?.name} · {topPost.likes} Likes · {topPost.comments.length} Kommentare
              </p>
              <Link to="/community" className="tap mt-3 inline-flex items-center gap-1 text-[12.5px] font-bold text-royal-700">
                Im Feed ansehen <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </Card>
          )}

          {/* Aktivitäts-Feed */}
          <Card className="overflow-hidden">
            <div className="border-b border-mist-200 px-5 py-3.5">
              <h2 className="text-[15px] font-bold text-deep-900">Letzte Aktivität</h2>
            </div>
            <div className="divide-y divide-mist-100">
              {activities.map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-royal-50 text-royal-600">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <p className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-deep-900">{a.text}</p>
                    <span className="shrink-0 text-[10.5px] text-slate-400">
                      {new Date(a.time + 'T12:00').toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Top-Produkte */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-mist-200 px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-deep-900">
                <Package className="h-[18px] w-[18px] text-royal-600" aria-hidden /> Top-Produkte
              </h2>
              <Link to="/produkte" className="text-[12.5px] font-bold text-royal-700">
                Alle →
              </Link>
            </div>
            <div className="divide-y divide-mist-100">
              {products.filter((p) => p.badge === 'Bestseller').slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-deep-900">{p.shortTitle}</p>
                    <p className="text-[11px] text-slate-400">{p.vendor} · Bestand {p.stock}</p>
                  </div>
                  <span className="text-[13px] font-extrabold tabular-nums text-deep-950">{eur(p.price)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
