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
} from 'lucide-react';
import { useAdmin, eur, statusColor } from '../store/AdminStore';
import { Card, PageHeader, Stat, Badge } from '../components/ui';

export default function Dashboard() {
  const { products, courses, events, posts, members, orders, outbox } = useAdmin();

  const revenue = orders.filter((o) => o.status !== 'storniert').reduce((n, o) => n + o.total, 0);
  const enrollments = courses.reduce((n, c) => n + c.enrollments, 0);
  const lowStock = products.filter((p) => p.active && p.stock < 15);
  const openOrders = orders.filter((o) => o.status === 'bestätigt' || o.status === 'versandt');
  const inactive = products.filter((p) => !p.active).length;
  const hiddenPosts = posts.filter((p) => p.hidden).length;

  // Demo-Diagramm: Bestellungen der letzten 6 Monate
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov'];
  const counts = [9, 14, 11, 17, 21, orders.filter((o) => o.dateISO.startsWith('2026-11')).length + 8];
  const maxCount = Math.max(...counts);

  return (
    <div className="anim-fade-up">
      <PageHeader
        title="Dashboard"
        sub="Überblick über die gesamte GLAMLOOX App (Demo-Daten)"
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<Euro className="h-5 w-5" aria-hidden />} label="Demo-Umsatz" value={eur(revenue)} hint="ohne storniert" />
        <Stat icon={<ShoppingBag className="h-5 w-5" aria-hidden />} label="Bestellungen" value={orders.length.toString()} hint={`${openOrders.length} offen`} tone="emerald" />
        <Stat icon={<GraduationCap className="h-5 w-5" aria-hidden />} label="Einschreibungen" value={enrollments.toLocaleString('de-DE')} hint={`${courses.length} Kurse`} />
        <Stat icon={<Users className="h-5 w-5" aria-hidden />} label="Community" value={members.length.toString()} hint={`${posts.length} Beiträge`} tone="gold" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Diagramm */}
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-deep-900">Bestellungen pro Monat</h2>
            <Badge className="bg-royal-50 text-royal-700">
              <TrendingUp className="mr-1 h-3 w-3" aria-hidden /> +23 % vs. Vormonat
            </Badge>
          </div>
          <div className="mt-5 flex h-[150px] items-end gap-3">
            {months.map((m, i) => (
              <div key={m} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[11px] font-bold text-deep-900 tabular-nums">{counts[i]}</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-royal-600 to-royal-400 transition-all"
                  style={{ height: `${(counts[i] / maxCount) * 110}px` }}
                  aria-hidden
                />
                <span className="text-[11px] font-semibold text-slate-400">{m}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10.5px] text-slate-400">Demo-Daten zur Veranschaulichung des Dashboards.</p>
        </Card>

        {/* Handlungsbedarf */}
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
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Letzte Bestellungen */}
        <Card className="overflow-hidden">
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

        {/* Top-Produkte + Outbox */}
        <div className="space-y-4">
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

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-mist-200 px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-deep-900">
                <Radio className="h-[18px] w-[18px] text-royal-600" aria-hidden /> Letzte Mitteilungen
              </h2>
              <Link to="/mitteilungen" className="text-[12.5px] font-bold text-royal-700">
                Alle →
              </Link>
            </div>
            <div className="divide-y divide-mist-100">
              {outbox.slice(0, 2).map((n) => (
                <div key={n.id} className="px-5 py-3">
                  <p className="truncate text-[13px] font-bold text-deep-900">{n.title}</p>
                  <p className="text-[11px] text-slate-400">
                    {n.target} · {new Date(n.sentISO + 'T12:00').toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
