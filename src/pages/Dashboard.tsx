import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  GraduationCap,
  Users,
  Euro,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Radio,
  Sparkles,
  Download,
  Target,
  Filter,
  Heart,
  Ticket,
  MousePointerClick,
  ShoppingCart,
  CreditCard,
  Repeat,
  Crown,
  RefreshCw,
} from 'lucide-react';
import { useAdmin, eur, statusColor, type OrderStatus } from '../store/AdminStore';
import { Card, Badge, Button } from '../components/ui';

type Range = '30' | '90' | '365' | 'alle';
const RANGES: { id: Range; label: string }[] = [
  { id: '30', label: '30 Tage' },
  { id: '90', label: 'Quartal' },
  { id: '365', label: 'Jahr' },
  { id: 'alle', label: 'Gesamt' },
];

const MONTHS_SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

// ═══ SVG-Charts (ohne Dependencies) ═══
function AreaChart({ data, labels, format }: { data: number[]; labels: string[]; format: (n: number) => string }) {
  const max = Math.max(...data, 1);
  const W = 560;
  const H = 170;
  const pad = 6;
  const pts = data.map((v, i) => {
    const x = pad + (i / Math.max(1, data.length - 1)) * (W - pad * 2);
    const y = H - 26 - (v / max) * (H - 46);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${H - 26} L${pts[0][0].toFixed(1)},${H - 26} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Umsatzverlauf">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E5BF0" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#2E5BF0" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={pad} x2={W - pad} y1={26 + f * (H - 52)} y2={26 + f * (H - 52)} stroke="#E3ECFD" strokeWidth="1" strokeDasharray="4 5" />
      ))}
      <path d={area} fill="url(#areaFill)" />
      <path d={line} fill="none" stroke="#2E5BF0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="3.2" fill="#fff" stroke="#2E5BF0" strokeWidth="2" />
          <title>{`${labels[i]}: ${format(data[i])}`}</title>
        </g>
      ))}
      {labels.map((l, i) => (
        <text key={i} x={pts[i][0]} y={H - 8} textAnchor="middle" fontSize="10.5" fill="#94A3B8" fontWeight="600">
          {l}
        </text>
      ))}
      <text x={pad} y="16" fontSize="10.5" fill="#94A3B8" fontWeight="700">
        max {format(max)}
      </text>
    </svg>
  );
}

function Donut({ segments, centerTop, centerSub }: { segments: { label: string; value: number; color: string }[]; centerTop: string; centerSub: string }) {
  const total = segments.reduce((n, s) => n + s.value, 0) || 1;
  let acc = 0;
  const R = 15.9;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 42 42" className="h-[128px] w-[128px] shrink-0" role="img" aria-label="Statusverteilung">
        <circle cx="21" cy="21" r={R} fill="none" stroke="#EFF4FF" strokeWidth="5.5" />
        {segments.map((s) => {
          const frac = s.value / total;
          const el = (
            <circle
              key={s.label}
              cx="21"
              cy="21"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="5.5"
              strokeDasharray={`${(frac * 100).toFixed(2)} ${100 - frac * 100}`}
              strokeDashoffset={`${(25 - acc * 100).toFixed(2)}`}
            >
              <title>{`${s.label}: ${s.value}`}</title>
            </circle>
          );
          acc += frac;
          return el;
        })}
        <text x="21" y="20" textAnchor="middle" fontSize="8" fontWeight="800" fill="#0A1E5A">
          {centerTop}
        </text>
        <text x="21" y="26.5" textAnchor="middle" fontSize="4.4" fontWeight="700" fill="#94A3B8">
          {centerSub}
        </text>
      </svg>
      <div className="min-w-0 flex-1 space-y-1.5">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-[12px]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
            <span className="flex-1 truncate font-semibold capitalize text-slate-600">{s.label}</span>
            <span className="font-bold tabular-nums text-deep-950">{s.value}</span>
            <span className="w-10 text-right text-[11px] font-semibold tabular-nums text-slate-400">{Math.round((s.value / total) * 100)} %</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Funnel({ steps }: { steps: { label: string; value: number; icon: typeof Users }[] }) {
  const max = steps[0]?.value || 1;
  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const pct = (s.value / max) * 100;
        const stepPct = i === 0 ? 100 : (s.value / steps[i - 1].value) * 100;
        return (
          <div key={s.label} className="group">
            <div className="mb-1 flex items-center gap-2 text-[11.5px]">
              <Icon className="h-3.5 w-3.5 shrink-0 text-royal-500" aria-hidden />
              <span className="flex-1 font-semibold text-slate-600">{s.label}</span>
              <span className="font-bold tabular-nums text-deep-950">{s.value.toLocaleString('de-DE')}</span>
              {i > 0 && <span className="w-12 text-right font-bold text-royal-600">{Math.round(stepPct)} %</span>}
            </div>
            <div className="h-6 overflow-hidden rounded-lg bg-mist-100">
              <div
                className="flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-royal-500 to-royal-700 pr-2 transition-all group-hover:from-royal-600"
                style={{ width: `${Math.max(6, pct)}%` }}
              >
                <span className="text-[9.5px] font-extrabold text-white/90">{Math.round(pct)} %</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProgressRing({ pct, value, label }: { pct: number; value: string; label: string }) {
  const clamped = Math.min(100, Math.max(0, pct));
  const C = 2 * Math.PI * 15.9;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 42 42" className="h-[110px] w-[110px] shrink-0">
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="#EFF4FF" strokeWidth="4.5" />
        <circle
          cx="21"
          cy="21"
          r="15.9"
          fill="none"
          stroke={clamped >= 100 ? '#10B981' : '#2E5BF0'}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * C} ${C}`}
          transform="rotate(-90 21 21)"
        />
        <text x="21" y="20" textAnchor="middle" fontSize="7.6" fontWeight="800" fill="#0A1E5A">
          {value}
        </text>
        <text x="21" y="27" textAnchor="middle" fontSize="4.2" fontWeight="700" fill="#94A3B8">
          {label}
        </text>
      </svg>
      <div>
        <p className="text-[22px] font-extrabold tabular-nums text-deep-950">{Math.round(clamped)} %</p>
        <p className="text-[11.5px] font-semibold text-slate-400">vom Monatsziel erreicht</p>
        {clamped >= 100 && <Badge className="mt-1.5 bg-emerald-100 text-emerald-700">Ziel erreicht 🎉</Badge>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { products, courses, posts, members, orders, outbox, promotions, adminName, rewardPoints, punkteRegeln } = useAdmin();
  const [range, setRange] = useState<Range>('365');
  const [refreshAt, setRefreshAt] = useState(() => new Date());

  // ── Zeitraum-Filter ──
  const cutoff = useMemo(() => {
    if (range === 'alle') return '0000-00-00';
    const d = new Date();
    d.setDate(d.getDate() - parseInt(range, 10));
    return d.toISOString().slice(0, 10);
  }, [range]);
  const filteredOrders = useMemo(() => orders.filter((o) => o.dateISO >= cutoff), [orders, cutoff]);

  // ── KPI-Kernzahlen ──
  const valid = filteredOrders.filter((o) => o.status !== 'storniert');
  const revenue = valid.reduce((n, o) => n + o.total, 0);
  const avgOrder = valid.length > 0 ? revenue / valid.length : 0;
  const openOrders = filteredOrders.filter((o) => o.status === 'bestätigt' || o.status === 'versandt');
  const stornoRate = filteredOrders.length > 0 ? (filteredOrders.filter((o) => o.status === 'storniert').length / filteredOrders.length) * 100 : 0;
  const kunden = new Set(filteredOrders.map((o) => o.customer)).size;
  const repeatKunden = [...new Set(filteredOrders.map((o) => o.customer))].filter(
    (c) => filteredOrders.filter((o) => o.customer === c).length >= 2,
  ).length;
  const enrollments = courses.reduce((n, c) => n + c.enrollments, 0);
  const engagement = posts.length > 0 ? posts.reduce((n, p) => n + p.likes, 0) / posts.length : 0;

  // ── Monatsvergleich (echt) ──
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = prevDate.toISOString().slice(0, 7);
  const revThis = orders.filter((o) => o.status !== 'storniert' && o.dateISO.startsWith(thisMonth)).reduce((n, o) => n + o.total, 0);
  const revPrev = orders.filter((o) => o.status !== 'storniert' && o.dateISO.startsWith(prevMonth)).reduce((n, o) => n + o.total, 0);
  const momDelta = revPrev > 0 ? Math.round(((revThis - revPrev) / revPrev) * 100) : 0;

  // ── 12-Monats-Verlauf (Demo-Basis + echte Bestellungen) ──
  const monthly = useMemo(() => {
    const base = [420, 480, 450, 520, 610, 580, 660, 700, 760, 820, 900, 0];
    const arr: { label: string; value: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      const real = orders.filter((o) => o.status !== 'storniert' && o.dateISO.startsWith(key)).reduce((n, o) => n + o.total, 0);
      const demoBase = base[11 - i] ?? 0;
      arr.push({ label: MONTHS_SHORT[d.getMonth()], value: Math.round(Math.max(demoBase, real) + real) });
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, refreshAt]);
  const forecast = Math.round(monthly[monthly.length - 1].value * (1 + Math.max(0.05, momDelta / 100)));

  // ── Kategorie-Umsatz ──
  const catRevenue = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of valid) {
      for (const it of o.items) {
        const cat = products.find((p) => p.id === it.productId)?.category ?? 'pflege';
        map.set(cat, (map.get(cat) ?? 0) + it.price * it.qty);
      }
    }
    const demoFill: Record<string, number> = { 'lash-lifting': 380, pflege: 520, brow: 240, zubehoer: 160 };
    return [...map.entries()]
      .map(([cat, v]) => ({ cat, value: Math.round(v + (demoFill[cat] ?? 0)) }))
      .sort((a, b) => b.value - a.value);
  }, [valid, products]);

  // ── Top-Produkte ──
  const topProducts = useMemo(() => {
    const qty = new Map<string, number>();
    for (const o of valid) for (const it of o.items) qty.set(it.productId, (qty.get(it.productId) ?? 0) + it.qty);
    const demoSeed: Record<string, number> = { 'lash-booster': 34, 'brow-booster': 22, 'booster-set': 18, 'peptide-mascara': 15, 'pads-fusion': 12 };
    return Object.entries(demoSeed)
      .map(([id, n]) => ({ p: products.find((x) => x.id === id), qty: n + (qty.get(id) ?? 0) }))
      .filter((x) => x.p)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [valid, products]);

  // ── Status-Donut ──
  const statusSegs: { label: OrderStatus; value: number; color: string }[] = (
    [
      { label: 'geliefert' as const, color: '#10B981' },
      { label: 'versandt' as const, color: '#F59E0B' },
      { label: 'bestätigt' as const, color: '#2E5BF0' },
      { label: 'storniert' as const, color: '#EF4444' },
    ] as const
  )
    .map((s) => ({ ...s, value: filteredOrders.filter((o) => o.status === s.label).length }))
    .filter((s) => s.value > 0);

  // ── Wochentage / Kurse / Aktionen ──
  const weekdayCounts = [12, 15, 14, 11, 9, 17, 21];
  const weekdayMax = Math.max(...weekdayCounts);
  const courseRank = [...courses].sort((a, b) => b.enrollments - a.enrollments).slice(0, 4);
  const courseMax = courseRank[0]?.enrollments || 1;

  const today = now.toISOString().slice(0, 10);
  const daysUntil = (iso: string) =>
    Math.round((new Date(iso + 'T00:00').getTime() - new Date(today + 'T00:00').getTime()) / 86400000);
  const runningPromos = promotions.filter((p) => p.active && p.startDate <= today && p.endDate >= today);
  const plannedPromos = promotions.filter((p) => p.startDate > today);
  const lowStock = products.filter((p) => p.active && p.stock < 15);
  const inactive = products.filter((p) => !p.active).length;
  const hiddenPosts = posts.filter((p) => p.hidden).length;
  const topPost = [...posts].sort((a, b) => b.likes - a.likes)[0];
  const topAuthor = members.find((m) => m.id === topPost?.authorId);
  const hour = now.getHours();
  const greeting = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';
  const MONATSZIEL = 600;

  const kpis = [
    {
      id: 'umsatz',
      icon: <Euro className="h-5 w-5" aria-hidden />,
      label: 'Umsatz',
      value: eur(revenue),
      hint: `${valid.length} Bestellungen · Ø ${eur(avgOrder)}`,
      tone: 'royal' as const,
      delta: `${momDelta >= 0 ? '+' : ''}${momDelta} % MoM`,
      up: momDelta >= 0,
    },
    {
      id: 'kunden',
      icon: <Users className="h-5 w-5" aria-hidden />,
      label: 'Kundinnen',
      value: kunden.toString(),
      hint: `${repeatKunden} Wiederholer · ${Math.round((repeatKunden / Math.max(1, kunden)) * 100)} % Rate`,
      tone: 'emerald' as const,
      delta: `${repeatKunden}× 2+ Käufe`,
      up: true,
    },
    {
      id: 'academy',
      icon: <GraduationCap className="h-5 w-5" aria-hidden />,
      label: 'Einschreibungen',
      value: enrollments.toLocaleString('de-DE'),
      hint: `${courses.length} Kurse`,
      tone: 'royal' as const,
      delta: '+4,2 %',
      up: true,
    },
    {
      id: 'storno',
      icon: <ShoppingBag className="h-5 w-5" aria-hidden />,
      label: 'Stornoquote',
      value: `${Math.round(stornoRate)} %`,
      hint: `${openOrders.length} offen`,
      tone: 'gold' as const,
      delta: stornoRate > 15 ? 'über Ziel' : 'im Ziel',
      up: stornoRate <= 15,
    },
  ];

  const exportKPIs = () => {
    const rows = [
      ['Kennzahl', 'Wert', `Zeitraum: ${RANGES.find((r) => r.id === range)?.label}`].join(';'),
      ['Umsatz (EUR)', revenue.toFixed(2).replace('.', ',')].join(';'),
      ['Bestellungen', String(valid.length)].join(';'),
      ['Ø Bestellwert (EUR)', avgOrder.toFixed(2).replace('.', ',')].join(';'),
      ['Kundinnen', String(kunden)].join(';'),
      ['Wiederholer', String(repeatKunden)].join(';'),
      ['Stornoquote (%)', stornoRate.toFixed(1).replace('.', ',')].join(';'),
      ['Einschreibungen', String(enrollments)].join(';'),
      ['Engagement (Likes/Beitrag)', engagement.toFixed(1).replace('.', ',')].join(';'),
    ];
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'glamloox-kpis.csv';
    a.click();
  };

  return (
    <div className="anim-fade-up">
      {/* ═══ Hero ═══ */}
      <div className="relative mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-deep-950 via-deep-900 to-royal-800 px-6 py-6 shadow-float">
        <div className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full opacity-30 blur-2xl" style={{ background: 'radial-gradient(circle, #7A96F8, transparent 70%)' }} aria-hidden />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-royal-300">
              GLAMLOOX Admin · {greeting}, {adminName}
            </p>
            <h1 className="mt-1.5 text-[26px] font-extrabold tracking-tight text-white">Dein Prototyp auf einen Blick</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Ohne Hormone', 'Vegan', 'Tierversuchsfrei'].map((u) => (
                <span key={u} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur">
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
            <Button variant="ghost" onClick={exportKPIs} className="!border-white/25 !bg-white/10 !text-white hover:!bg-white/20">
              <Download className="h-4 w-4" aria-hidden /> KPIs
            </Button>
            <Button variant="ghost" onClick={() => setRefreshAt(new Date())} className="!border-white/25 !bg-white/10 !text-white hover:!bg-white/20">
              <RefreshCw className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
        <p className="relative mt-3 text-[10.5px] text-white/40">
          Stand {refreshAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr · Zeitraum: {RANGES.find((r) => r.id === range)?.label} · {punkteRegeln.euroProPunkt} € = 1 P.
        </p>
      </div>

      {/* ═══ Zeitraum-Filter ═══ */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <Filter className="h-4 w-4 text-slate-400" aria-hidden />
        {RANGES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRange(r.id)}
            className={`tap rounded-full px-4 py-1.5 text-[12.5px] font-bold ${range === r.id ? 'bg-deep-900 text-white shadow-card' : 'border border-mist-200 bg-white text-slate-500'}`}
          >
            {r.label}
          </button>
        ))}
        <span className="ml-auto text-[11.5px] font-semibold text-slate-400">{filteredOrders.length} Bestellungen im Zeitraum</span>
      </div>

      {/* ═══ KPI-Karten (klickbar → Verlauf) ═══ */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <button
            key={k.id}
            onClick={() => document.getElementById('chart-umsatz')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            aria-label={`${k.label}-Verlauf anzeigen`}
            className="group tap text-left"
          >
            <Card className="relative overflow-hidden p-4 transition-shadow group-hover:shadow-float">
              <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-royal-50" aria-hidden />
              <div className="relative flex items-center gap-3.5">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-card ${
                    k.tone === 'gold'
                      ? 'bg-gradient-to-br from-gold-400 to-gold-500'
                      : k.tone === 'emerald'
                        ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                        : 'bg-gradient-to-br from-royal-500 to-deep-900'
                  }`}
                >
                  {k.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{k.label}</p>
                  <p className="text-[22px] font-extrabold leading-tight tabular-nums text-deep-950">{k.value}</p>
                  <p className="truncate text-[11px] text-slate-400">{k.hint}</p>
                </div>
              </div>
              <div className="relative mt-2 flex items-center justify-between">
                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${k.up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500'}`}>
                  {k.up ? <TrendingUp className="h-3 w-3" aria-hidden /> : <TrendingDown className="h-3 w-3" aria-hidden />}
                  {k.delta}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              </div>
            </Card>
          </button>
        ))}
      </div>

      {/* ═══ Umsatz-Verlauf + Ziel + Aktionen ═══ */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="chart-umsatz" className="scroll-mt-24 text-[15px] font-bold text-deep-900">
              Umsatzverlauf · 12 Monate
            </h2>
            <Badge className="bg-emerald-50 text-emerald-700">
              <TrendingUp className="mr-1 h-3 w-3" aria-hidden /> Forecast: {eur(forecast)} nächsten Monat
            </Badge>
          </div>
          <div className="mt-4">
            <AreaChart data={monthly.map((m) => m.value)} labels={monthly.map((m) => m.label)} format={(n) => eur(n)} />
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-mist-100 pt-3 text-[11px] font-semibold text-slate-400">
            <span>inkl. Demo-Historie · {eur(monthly.reduce((n, m) => n + m.value, 0))} Gesamt</span>
            <span>MoM {momDelta >= 0 ? '+' : ''}{momDelta} %</span>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-bold text-deep-900">
              <Target className="h-[18px] w-[18px] text-royal-600" aria-hidden /> Ziel des Monats
            </h2>
            <div className="mt-3">
              <ProgressRing pct={(revThis / MONATSZIEL) * 100} value={eur(revThis)} label={`von ${eur(MONATSZIEL)}`} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-deep-900">
                <Ticket className="h-[18px] w-[18px] text-royal-600" aria-hidden /> Aktionen
              </h2>
              <Link to="/aktionen" className="text-[12px] font-bold text-royal-700">
                Verwalten →
              </Link>
            </div>
            <div className="mt-3 space-y-2">
              {runningPromos.slice(0, 2).map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-deep-950 to-royal-800 px-3.5 py-2.5">
                  <span className="text-[18px]">{p.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-bold text-white">{p.name}</p>
                    <p className="text-[10px] text-royal-100/70">läuft · noch {daysUntil(p.endDate)} Tage</p>
                  </div>
                  <span className="rounded-full bg-gold-400 px-2 py-0.5 text-[10px] font-extrabold text-deep-950">−{p.value} %</span>
                </div>
              ))}
              {plannedPromos.slice(0, 1).map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-dashed border-royal-200 bg-royal-50/50 px-3.5 py-2.5">
                  <span className="text-[18px]">{p.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-bold text-deep-900">{p.name}</p>
                    <p className="text-[10px] text-slate-500">startet in {daysUntil(p.startDate)} Tagen</p>
                  </div>
                </div>
              ))}
              {runningPromos.length === 0 && plannedPromos.length === 0 && (
                <p className="rounded-xl bg-mist-50 px-3.5 py-3 text-[12px] text-slate-400">
                  Keine Aktionen aktiv – Konstruktor im Reiter „Aktionen“.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ═══ Funnel + Donut + Wochentage ═══ */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-[15px] font-bold text-deep-900">
            <MousePointerClick className="h-[18px] w-[18px] text-royal-600" aria-hidden /> Conversion-Funnel
          </h2>
          <p className="mt-0.5 text-[11px] font-medium text-slate-400">App-Demo · 7,4 % Gesamt-Conversion</p>
          <div className="mt-4">
            <Funnel
              steps={[
                { label: 'App-Besuche', value: 4200, icon: Users },
                { label: 'Produkt angesehen', value: 1980, icon: MousePointerClick },
                { label: 'In den Warenkorb', value: 860, icon: ShoppingCart },
                { label: 'Checkout gestartet', value: 410, icon: CreditCard },
                { label: 'Kauf abgeschlossen', value: 312, icon: Euro },
              ]}
            />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-[15px] font-bold text-deep-900">
            <ShoppingBag className="h-[18px] w-[18px] text-royal-600" aria-hidden /> Bestellstatus
          </h2>
          <p className="mt-0.5 text-[11px] font-medium text-slate-400">Verteilung im Zeitraum</p>
          <div className="mt-4">
            {statusSegs.length > 0 ? (
              <Donut segments={statusSegs} centerTop={String(filteredOrders.length)} centerSub="Bestellungen" />
            ) : (
              <p className="py-8 text-center text-[12.5px] text-slate-400">Keine Bestellungen im Zeitraum.</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-[15px] font-bold text-deep-900">
            <RefreshCw className="h-[18px] w-[18px] text-royal-600" aria-hidden /> Bestellungen je Wochentag
          </h2>
          <p className="mt-0.5 text-[11px] font-medium text-slate-400">Peak: Wochenende</p>
          <div className="mt-4 flex h-[150px] items-end gap-2.5">
            {weekdayCounts.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5" title={`${WEEKDAYS[i]}: ${v} Bestellungen`}>
                <span className="text-[10.5px] font-bold tabular-nums text-deep-900">{v}</span>
                <div
                  className={`w-full rounded-t-lg transition-all hover:opacity-80 ${i === 5 || i === 6 ? 'bg-gradient-to-t from-gold-500 to-gold-400' : 'bg-gradient-to-t from-royal-600 to-royal-400'}`}
                  style={{ height: `${(v / weekdayMax) * 105}px` }}
                  aria-hidden
                />
                <span className="text-[10.5px] font-semibold text-slate-400">{WEEKDAYS[i]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ═══ Kategorien + Top-Produkte + Kurse ═══ */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-5">
          <h2 className="text-[15px] font-bold text-deep-900">Umsatz je Kategorie</h2>
          <div className="mt-4 space-y-3">
            {catRevenue.map(({ cat, value }) => {
              const pct = Math.round((value / catRevenue[0].value) * 100);
              return (
                <div key={cat}>
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <span className="font-semibold capitalize text-slate-600">{cat.replace('-', ' ')}</span>
                    <span className="font-bold tabular-nums text-deep-950">{eur(value)}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-mist-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-royal-400 to-royal-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[15px] font-bold text-deep-900">
              <Package className="h-[18px] w-[18px] text-royal-600" aria-hidden /> Top-Produkte
            </h2>
            <Link to="/produkte" className="text-[12px] font-bold text-royal-700">Alle →</Link>
          </div>
          <div className="mt-4 space-y-3">
            {topProducts.map(({ p, qty }, i) => (
              <div key={p!.id} className="flex items-center gap-3">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10.5px] font-extrabold ${i === 0 ? 'bg-gold-400 text-white' : 'bg-mist-200 text-slate-500'}`}>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-bold text-deep-900">{p!.shortTitle}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-mist-100">
                    <div className="h-full rounded-full bg-royal-500" style={{ width: `${(qty / topProducts[0].qty) * 100}%` }} />
                  </div>
                </div>
                <span className="shrink-0 text-[12px] font-extrabold tabular-nums text-deep-950">{qty}×</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[15px] font-bold text-deep-900">
              <GraduationCap className="h-[18px] w-[18px] text-royal-600" aria-hidden /> Academy-Ranking
            </h2>
            <Link to="/kurse" className="text-[12px] font-bold text-royal-700">Alle →</Link>
          </div>
          <div className="mt-4 space-y-3">
            {courseRank.map((c, i) => (
              <Link key={c.id} to="/kurse" className="tap block">
                <div className="mb-1 flex items-center gap-2 text-[12px]">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9.5px] font-extrabold ${i === 0 ? 'bg-gold-400 text-white' : 'bg-mist-200 text-slate-500'}`}>
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-slate-600">{c.shortTitle}</span>
                  <span className="font-bold tabular-nums text-deep-950">{c.enrollments.toLocaleString('de-DE')}</span>
                </div>
                <div className="ml-7 h-1.5 overflow-hidden rounded-full bg-mist-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${(c.enrollments / courseMax) * 100}%` }} />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-mist-50 px-3.5 py-2.5">
            <span className="text-[11.5px] font-semibold text-slate-500">Engagement Community</span>
            <span className="flex items-center gap-1 text-[13px] font-extrabold text-deep-950">
              <Heart className="h-3.5 w-3.5 text-royal-500" aria-hidden /> {Math.round(engagement)} / Beitrag
            </span>
          </div>
        </Card>
      </div>

      {/* ═══ Quick-Actions ═══ */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { to: '/aktionen', label: 'Aktion starten', icon: Sparkles },
          { to: '/produkte', label: 'Produkt anlegen', icon: Package },
          { to: '/events', label: 'Event anlegen', icon: Radio },
          { to: '/mitteilungen', label: 'Mitteilung senden', icon: Radio },
        ].map(({ to, label, icon: Icon }) => (
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

      {/* ═══ Handeln + Bestellungen + Aktivität ═══ */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
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
              { to: '/aktionen', label: `${plannedPromos.length} geplante Aktionen`, tone: plannedPromos.length > 0 },
            ].map(({ to, label, tone }) => (
              <Link
                key={label}
                to={to}
                className={`tap flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[12.5px] font-semibold ${tone ? 'bg-amber-50 text-amber-800' : 'bg-mist-50 text-slate-500'}`}
              >
                {label}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white">
              <Repeat className="h-[17px] w-[17px]" aria-hidden />
            </span>
            <div>
              <p className="text-[12.5px] font-bold text-deep-900">{repeatKunden} Wiederholungskundinnen</p>
              <p className="text-[11px] text-slate-500">Booster-Kundschaft kauft im Schnitt 2,3× ein</p>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-mist-200 px-5 py-3.5">
            <h2 className="text-[15px] font-bold text-deep-900">Letzte Bestellungen</h2>
            <Link to="/bestellungen" className="text-[12.5px] font-bold text-royal-700">Alle →</Link>
          </div>
          <div className="divide-y divide-mist-100">
            {filteredOrders.slice(0, 5).map((o) => (
              <Link key={o.id} to="/bestellungen" className="tap flex items-center gap-3 px-5 py-3 hover:bg-mist-50">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: o.status === 'storniert' ? '#EF4444' : o.status === 'geliefert' ? '#10B981' : o.status === 'versandt' ? '#F59E0B' : '#2E5BF0' }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-deep-900">
                    {o.id} · {o.customer}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(o.dateISO + 'T12:00').toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })} · {o.items.reduce((n, it) => n + it.qty, 0)} Artikel
                  </p>
                </div>
                <span className="text-[13px] font-extrabold tabular-nums text-deep-950">{eur(o.total)}</span>
                <Badge className={statusColor[o.status]}>{o.status}</Badge>
              </Link>
            ))}
            {filteredOrders.length === 0 && <p className="px-5 py-10 text-center text-[12.5px] text-slate-400">Keine Bestellungen im gewählten Zeitraum.</p>}
          </div>
        </Card>

        <div className="space-y-4">
          {topPost && (
            <Card className="p-5">
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-deep-900">
                <Crown className="h-[18px] w-[18px] text-gold-500" aria-hidden /> Top-Beitrag
              </h2>
              <p className="mt-2 line-clamp-2 text-[13px] font-bold text-deep-900">{topPost.title ?? topPost.text}</p>
              <p className="mt-1 text-[11.5px] text-slate-400">
                {topAuthor?.name} · {topPost.likes} Likes · {topPost.comments.length} Kommentare · Ø {Math.round(engagement)}/Beitrag
              </p>
              <Link to="/community" className="tap mt-3 inline-flex items-center gap-1 text-[12.5px] font-bold text-royal-700">
                Im Feed ansehen <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </Card>
          )}

          <Card className="overflow-hidden">
            <div className="border-b border-mist-200 px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-deep-900">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden /> Letzte Aktivität
              </h2>
            </div>
            <div className="divide-y divide-mist-100">
              {[
                ...filteredOrders.slice(0, 2).map((o) => ({ icon: ShoppingBag, text: `Bestellung ${o.id} (${o.status})`, time: o.dateISO })),
                ...promotions.filter((p) => p.active).slice(0, 1).map((p) => ({ icon: Ticket, text: `Aktion „${p.name}“ aktiv`, time: p.startDate })),
                ...outbox.slice(0, 1).map((n) => ({ icon: Radio, text: `Mitteilung „${n.title}“ gesendet`, time: n.sentISO })),
              ]
                .sort((a, b) => b.time.localeCompare(a.time))
                .slice(0, 4)
                .map((a, i) => {
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

          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-bold text-deep-900">System-Status</h2>
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

      <p className="mt-6 pb-2 text-center text-[10.5px] text-slate-400">
        Dashboard v3 · Kennzahlen teils Demo-basiert (12-Monats-Historie, Funnel, Wochentage) · KPI-Karten scrollen zum Verlauf
      </p>
    </div>
  );
}
