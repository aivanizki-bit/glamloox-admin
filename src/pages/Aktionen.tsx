import { useState } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  Percent,
  Euro,
  Ticket,
  Truck,
  Gift,
  ArrowRight,
  ArrowLeft,
  Shuffle,
} from 'lucide-react';
import { useAdmin, eur, type Promotion, type PromoType } from '../store/AdminStore';
import { Card, PageHeader, Badge, Button, Toggle, Modal, Stat, EmptyRow } from '../components/ui';

const today = new Date().toISOString().slice(0, 10);
const daysLeft = (iso: string) => Math.ceil((new Date(iso + 'T23:59').getTime() - Date.now()) / 86400000);

// ── Anlass-Vorlagen (Vollkalender + Custom) ──
const occasions = [
  { id: 'weihnachten', emoji: '🎄', label: 'Weihnachten', name: 'Weihnachtsaktion', start: '2026-11-20', end: '2026-12-24', banner: 'Adventsspezial: X % auf alles – bis Heiligabend', tint: 'from-emerald-600 to-deep-900' },
  { id: 'blackfriday', emoji: '🖤', label: 'Black Friday', name: 'Black Weekend', start: '2026-11-27', end: '2026-11-30', banner: 'Black Weekend: Code = X % auf alles', tint: 'from-slate-800 to-deep-950' },
  { id: 'valentinstag', emoji: '💙', label: 'Valentinstag', name: 'Valentins-Special', start: '2027-02-07', end: '2027-02-14', banner: 'Valentins-Special: X % für deine Beauty-Lieblinge', tint: 'from-royal-500 to-deep-900' },
  { id: 'muttertag', emoji: '🌷', label: 'Muttertag', name: 'Muttertag-Aktion', start: '2027-05-05', end: '2027-05-09', banner: 'Muttertag: X % – verwöhn dich und deine Mama', tint: 'from-pink-400 to-deep-900' },
  { id: 'halloween', emoji: '🎃', label: 'Halloween', name: 'Halloween-Special', start: '2027-10-24', end: '2027-10-31', banner: 'Halloween-Special: X % – gruselig gute Preise', tint: 'from-orange-500 to-deep-950' },
  { id: 'ostern', emoji: '🐣', label: 'Ostern', name: 'Oster-Aktion', start: '2027-03-26', end: '2027-04-05', banner: 'Oster-Spezial: X % auf alles', tint: 'from-amber-400 to-deep-900' },
  { id: 'sommer', emoji: '☀️', label: 'Sommer', name: 'Sommer-Sale', start: '2027-07-01', end: '2027-07-31', banner: 'Sommer-Sale: X % – sunshine for your lashes', tint: 'from-gold-400 to-deep-800' },
  { id: 'custom', emoji: '✨', label: 'Eigene Aktion', name: 'Meine Aktion', start: today, end: today, banner: 'X % auf alles – nur für kurze Zeit', tint: 'from-royal-500 to-deep-900' },
];

const typeCards: { id: PromoType; label: string; desc: string; icon: typeof Percent }[] = [
  { id: 'prozent', label: 'Prozent-Rabatt', desc: 'z. B. −20 % auf alles · automatisch im Warenkorb', icon: Percent },
  { id: 'fix', label: 'Fixer Rabatt', desc: 'z. B. −10 € ab 50 € Bestellwert', icon: Euro },
  { id: 'code', label: 'Code-Aktion', desc: 'z. B. BLACK25 → −25 % per Code', icon: Ticket },
  { id: 'versand', label: 'Gratis-Versand', desc: 'ab bestimmtem Bestellwert', icon: Truck },
  { id: 'bundle', label: 'Bundle: Produkt + Kurs', desc: 'Produkt kaufen → Academy-Kurs rabattiert/geschenkt', icon: Gift },
];

const typeBadges: Record<PromoType, { label: string; cls: string }> = {
  prozent: { label: '% Aktion', cls: 'bg-royal-600 text-white' },
  fix: { label: '€ Aktion', cls: 'bg-emerald-600 text-white' },
  code: { label: 'Code', cls: 'bg-deep-900 text-white' },
  versand: { label: 'Gratis-Versand', cls: 'bg-amber-500 text-white' },
  bundle: { label: 'Bundle', cls: 'bg-gold-500 text-white' },
};

export default function Aktionen() {
  const { promotions, addPromotion, updatePromotion, deletePromotion, products, courses, toast } = useAdmin();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [filter, setFilter] = useState<'alle' | 'laufend' | 'geplant' | 'beendet'>('alle');

  const running = promotions.filter((p) => p.active && p.startDate <= today && p.endDate >= today);
  const planned = promotions.filter((p) => p.startDate > today);
  const expired = promotions.filter((p) => p.endDate < today);
  const visible = promotions.filter((p) => {
    if (filter === 'laufend') return p.active && p.startDate <= today && p.endDate >= today;
    if (filter === 'geplant') return p.startDate > today;
    if (filter === 'beendet') return p.endDate < today || !p.active;
    return true;
  });

  return (
    <div className="anim-fade-up">
      <PageHeader
        title="Aktionen & Kampagnen"
        sub={`${running.length} laufend · ${planned.length} geplant · ${expired.length} beendet`}
        action={
          <Button onClick={() => setWizardOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden /> Aktion erstellen
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<Sparkles className="h-5 w-5" aria-hidden />} label="Laufende Aktionen" value={running.length.toString()} hint="jetzt aktiv" />
        <Stat icon={<Ticket className="h-5 w-5" aria-hidden />} label="Aktive Codes" value={promotions.filter((p) => p.type === 'code' && p.active).length.toString()} tone="emerald" />
        <Stat icon={<Percent className="h-5 w-5" aria-hidden />} label="Höchster Rabatt" value={Math.max(0, ...promotions.filter((p) => p.type === 'prozent' || p.type === 'code').map((p) => p.value)) + ' %'} tone="gold" />
        <Stat icon={<Truck className="h-5 w-5" aria-hidden />} label="Gratis-Versand ab" value={promotions.filter((p) => p.type === 'versand').length > 0 ? eur(Math.min(...promotions.filter((p) => p.type === 'versand').map((p) => p.value))) : '–'} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        {(['alle', 'laufend', 'geplant', 'beendet'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={'tap rounded-full px-3.5 py-1.5 text-[12.5px] font-bold capitalize ' + (filter === f ? 'bg-deep-900 text-white' : 'border border-mist-200 bg-white text-slate-500')}
          >
            {f} · {f === 'alle' ? promotions.length : f === 'laufend' ? running.length : f === 'geplant' ? planned.length : expired.length}
          </button>
        ))}
      </div>

      <div className="space-y-3.5">
        {[...visible]
          .sort((a, b) => Number(b.active) - Number(a.active) || b.endDate.localeCompare(a.endDate))
          .map((p) => (
            <PromoRow
              key={p.id}
              promo={p}
              onPatch={(patch) => updatePromotion(p.id, patch)}
              onDelete={() => { deletePromotion(p.id); toast('Aktion gelöscht', 'info'); }}
              onDuplicate={() => {
                const shift = (iso: string) => {
                  const d = new Date(iso + 'T12:00');
                  d.setDate(d.getDate() + 7);
                  return d.toISOString().slice(0, 10);
                };
                addPromotion({ ...p, name: p.name + ' (Kopie)', active: false, startDate: shift(p.startDate), endDate: shift(p.endDate) });
                toast('Aktion dupliziert (+7 Tage, inaktiv)', 'info');
              }}
            />
          ))}
        {promotions.length === 0 && <Card><EmptyRow text="Noch keine Aktionen – starte den Konstruktor!" /></Card>}
      </div>

      <PromoWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onCreate={(p) => {
          addPromotion(p);
          setWizardOpen(false);
          toast('Aktion gestartet 🎉');
        }}
        products={products}
        courses={courses}
      />
    </div>
  );
}

// ═══ Reihe einer Aktion ═══
function PromoRow({
  promo: p,
  onPatch,
  onDelete,
  onDuplicate,
}: {
  promo: Promotion;
  onPatch: (patch: Partial<Promotion>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const occ = occasions.find((o) => o.id === p.occasion);
  const d = daysLeft(p.endDate);
  const status =
    !p.active ? { label: 'Pausiert', cls: 'bg-mist-200 text-slate-500' }
    : p.startDate > today ? { label: `startet am ${new Date(p.startDate + 'T12:00').toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}`, cls: 'bg-royal-100 text-royal-700' }
    : d < 0 ? { label: 'Beendet', cls: 'bg-mist-200 text-slate-400' }
    : d <= 3 ? { label: `endet in ${d} Tagen!`, cls: 'bg-red-100 text-red-600' }
    : { label: `noch ${d} Tage`, cls: 'bg-emerald-100 text-emerald-700' };

  return (
    <Card className={`p-4 ${p.active && p.endDate >= today && p.startDate <= today ? 'border-royal-200' : 'opacity-80'}`}>
      <div className="flex flex-wrap items-center gap-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-[22px] shadow-card ${occ?.tint ?? 'from-royal-500 to-deep-900'}`}>
          {p.emoji || '✨'}
        </span>
        <div className="min-w-[200px] flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <p className="text-[15px] font-bold text-deep-900">{p.name}</p>
            <Badge className={typeBadges[p.type].cls}>{typeBadges[p.type].label}</Badge>
            <Badge className={status.cls}>{status.label}</Badge>
            {p.scope === 'eigenmarken' && <Badge className="bg-royal-50 text-royal-700">GLAMLOOX®</Badge>}
            {p.scope === 'kategorie' && <Badge className="bg-royal-50 text-royal-700 capitalize">{p.category.replace('-', ' ')}</Badge>}
          </div>
          <p className="mt-1 truncate text-[12.5px] font-medium text-slate-600">{p.bannerText}</p>
          <p className="mt-1 text-[11.5px] font-medium text-slate-500">
            {new Date(p.startDate + 'T12:00').toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })} –{' '}
            {new Date(p.endDate + 'T12:00').toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
            {p.type === 'prozent' || p.type === 'code' ? ` · −${p.value} %` : ''}
            {p.type === 'fix' ? ` · −${eur(p.value)}` : ''}
            {p.type === 'versand' ? ` · ab ${eur(p.value)}` : ''}
            {p.type === 'bundle' ? ` · Kurs −${p.value} %` : ''}
            {p.type === 'code' && p.code ? ` · Code: ${p.code}` : ''}
          </p>
        </div>
        {/* Live-Vorschau des Kundinnen-Banners */}
        <div className="hidden min-w-[240px] max-w-[300px] flex-1 xl:block">
          <div className="mr-4 rounded-2xl bg-gradient-to-r from-deep-950 to-royal-800 px-4 py-2.5 shadow-card">
            <p className="truncate text-[12.5px] font-bold text-white">
              {p.emoji} {p.bannerText.replace('X', String(p.value))}
            </p>
            <p className="text-[10px] text-white/50">So sieht es in der App aus (Demo-Vorschau)</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onDuplicate}
            aria-label={`${p.name} duplizieren`}
            className="tap flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-royal-50 hover:text-royal-600"
          >
            <Copy className="h-4 w-4" aria-hidden />
          </button>
          <button
            onClick={onDelete}
            aria-label={`${p.name} löschen`}
            className="tap flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
              {p.active ? <Eye className="h-4 w-4 text-royal-600" aria-hidden /> : <EyeOff className="h-4 w-4 text-slate-400" aria-hidden />}
              {p.active ? 'Aktiv' : 'Aus'}
            </span>
            <Toggle on={p.active} onChange={(v) => onPatch({ active: v })} label={`${p.name} aktiv`} />
          </div>
        </div>
      </div>
    </Card>
  );
}

// ═══ Der Konstruktor (4 Schritte) ═══
function PromoWizard({
  open,
  onClose,
  onCreate,
  products,
  courses,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (p: Omit<Promotion, 'id'>) => void;
  products: { id: string; shortTitle: string }[];
  courses: { id: string; title: string; shortTitle: string }[];
}) {
  const [step, setStep] = useState(1);
  const [occ, setOcc] = useState<string | null>(null);
  const [type, setType] = useState<PromoType | null>(null);
  const genCode = () => 'GLAM' + Math.floor(100 + Math.random() * 900);
  const [d, setD] = useState({
    name: '',
    value: '15',
    code: '',
    scope: 'alles' as Promotion['scope'],
    category: 'pflege',
    startDate: today,
    endDate: today,
    bannerText: '',
    bundleProduct: 'lash-booster',
    bundleCourse: 'big-korean-webinar',
  });

  const occData = occasions.find((o) => o.id === occ);
  const reset = () => {
    setStep(1);
    setOcc(null);
    setType(null);
    setD({ name: '', value: '15', code: '', scope: 'alles', category: 'pflege', startDate: today, endDate: today, bannerText: '', bundleProduct: 'lash-booster', bundleCourse: 'big-korean-webinar' });
  };

  const pickOccasion = (id: string) => {
    const o = occasions.find((x) => x.id === id)!;
    setOcc(id);
    setD((prev) => ({
      ...prev,
      name: o.name,
      startDate: o.start,
      endDate: o.end,
      bannerText: o.banner,
    }));
    setStep(2);
  };

  const valueLabel = type === 'fix' ? 'Rabatt (€)' : type === 'versand' ? 'Mindestbestellwert (€)' : type === 'bundle' ? 'Kurs-Rabatt (%)' : 'Rabatt (%)';

  const build = (): Omit<Promotion, 'id'> => ({
    name: d.name.trim() || 'Aktion',
    type: type ?? 'prozent',
    value: parseFloat(d.value.replace(',', '.')) || 0,
    code: type === 'code' ? (d.code || genCode()).toUpperCase() : '',
    scope: d.scope,
    category: d.scope === 'kategorie' ? d.category : '',
    startDate: d.startDate,
    endDate: d.endDate,
    active: true,
    occasion: occ ?? 'custom',
    bannerText: d.bannerText.trim() || `${d.value} % Aktion`,
    emoji: occData?.emoji ?? '✨',
    bundleProduct: type === 'bundle' ? d.bundleProduct : '',
    bundleCourse: type === 'bundle' ? d.bundleCourse : '',
  });

  return (
    <Modal open={open} onClose={() => { onClose(); reset(); }} title={step < 4 ? `Aktion erstellen · Schritt ${step} von 4` : 'Aktion prüfen & starten'}>
      {/* ── Schritt 1: Anlass ── */}
      {step === 1 && (
        <div>
          <p className="text-[13px] font-semibold text-slate-500">Wähle einen Anlass – Wir legen Datum, Name und Banner-Text automatisch an:</p>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {occasions.map((o) => (
              <button
                key={o.id}
                onClick={() => pickOccasion(o.id)}
                className={`tap flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all hover:border-royal-400 hover:shadow-card ${
                  o.id === 'custom' ? 'border-dashed border-royal-300 bg-royal-50/50' : 'border-mist-200 bg-white'
                }`}
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-[20px] text-white shadow-card ${o.tint}`}>
                  {o.emoji}
                </span>
                <span className="text-[12.5px] font-bold text-deep-900">{o.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Schritt 2: Typ ── */}
      {step === 2 && (
        <div>
          <p className="text-[13px] font-semibold text-slate-500">Was für eine Aktion soll es werden?</p>
          <div className="mt-4 space-y-2.5">
            {typeCards.map(({ id, label, desc, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setType(id); if (id === 'code' && !d.code) setD((p) => ({ ...p, code: genCode() })); setStep(3); }}
                className={`tap flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all hover:border-royal-400 hover:shadow-card ${
                  type === id ? 'border-royal-500 bg-royal-50' : 'border-mist-200 bg-white'
                }`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-royal-500 to-deep-900 text-white shadow-card">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="block text-[14.5px] font-bold text-deep-900">{label}</span>
                  <span className="block text-[12px] text-slate-500">{desc}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" aria-hidden />
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="mt-4" onClick={() => setStep(1)}>
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Zurück
          </Button>
        </div>
      )}

      {/* ── Schritt 3: Details ── */}
      {step === 3 && (
        <div className="space-y-3.5">
          <div>
            <p className="mb-1 text-[11.5px] font-semibold text-slate-400">Name der Aktion</p>
            <input
              value={d.name}
              onChange={(e) => setD({ ...d, name: e.target.value })}
              aria-label="Aktionsname"
              className="h-10 w-full rounded-xl border border-mist-200 bg-white px-3.5 text-[13.5px] font-semibold outline-none focus:border-royal-500"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <p className="mb-1 text-[11.5px] font-semibold text-slate-400">{valueLabel} *</p>
              <input
                value={d.value}
                onChange={(e) => setD({ ...d, value: e.target.value.replace(/[^\d,.]/g, '') })}
                inputMode="decimal"
                aria-label="Rabattwert"
                className="h-10 w-full rounded-xl border border-mist-200 bg-white px-3.5 text-[13.5px] font-bold outline-none focus:border-royal-500"
              />
            </div>
            <div className="flex-1">
              <p className="mb-1 text-[11.5px] font-semibold text-slate-400">Gültig für</p>
              <select
                value={d.scope}
                onChange={(e) => setD({ ...d, scope: e.target.value as Promotion['scope'] })}
                aria-label="Geltungsbereich"
                className="h-10 w-full rounded-xl border border-mist-200 bg-white px-3 text-[13px] font-medium outline-none"
              >
                <option value="alles">Gesamter Shop</option>
                <option value="eigenmarken">Nur GLAMLOOX® Eigenmarken</option>
                <option value="kategorie">Eine Kategorie</option>
              </select>
            </div>
          </div>
          {d.scope === 'kategorie' && (
            <select
              value={d.category}
              onChange={(e) => setD({ ...d, category: e.target.value })}
              aria-label="Kategorie"
              className="h-10 w-full rounded-xl border border-mist-200 bg-white px-3 text-[13px] font-medium outline-none"
            >
              <option value="pflege">Pflege</option>
              <option value="lash-lifting">Lash Lifting</option>
              <option value="brow">Brow & Farbe</option>
              <option value="zubehoer">Zubehör</option>
            </select>
          )}
          {type === 'code' && (
            <div>
              <p className="mb-1 text-[11.5px] font-semibold text-slate-400">Rabattcode (automatisch generiert)</p>
              <div className="flex gap-2">
                <input
                  value={d.code}
                  onChange={(e) => setD({ ...d, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                  maxLength={12}
                  aria-label="Rabattcode"
                  className="h-10 flex-1 rounded-xl border border-mist-200 bg-white px-3.5 font-mono text-[14px] font-bold tracking-wider outline-none focus:border-royal-500"
                />
                <Button variant="ghost" onClick={() => setD({ ...d, code: genCode() })} aria-label="Code neu generieren">
                  <Shuffle className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </div>
          )}
          {type === 'bundle' && (
            <div className="flex gap-3">
              <select
                value={d.bundleProduct}
                onChange={(e) => setD({ ...d, bundleProduct: e.target.value })}
                aria-label="Bundle-Produkt"
                className="h-10 flex-1 rounded-xl border border-mist-200 bg-white px-3 text-[12.5px] font-medium outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.shortTitle}</option>
                ))}
              </select>
              <select
                value={d.bundleCourse}
                onChange={(e) => setD({ ...d, bundleCourse: e.target.value })}
                aria-label="Bundle-Kurs"
                className="h-10 flex-1 rounded-xl border border-mist-200 bg-white px-3 text-[12.5px] font-medium outline-none"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.shortTitle}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-3">
            <div className="flex-1">
              <p className="mb-1 text-[11.5px] font-semibold text-slate-400">Startdatum</p>
              <input
                type="date"
                value={d.startDate}
                onChange={(e) => setD({ ...d, startDate: e.target.value })}
                aria-label="Startdatum"
                className="h-10 w-full rounded-xl border border-mist-200 bg-white px-3 text-[13px] outline-none focus:border-royal-500"
              />
            </div>
            <div className="flex-1">
              <p className="mb-1 text-[11.5px] font-semibold text-slate-400">Enddatum</p>
              <input
                type="date"
                value={d.endDate}
                onChange={(e) => setD({ ...d, endDate: e.target.value })}
                aria-label="Enddatum"
                className="h-10 w-full rounded-xl border border-mist-200 bg-white px-3 text-[13px] outline-none focus:border-royal-500"
              />
            </div>
          </div>
          <div>
            <p className="mb-1 text-[11.5px] font-semibold text-slate-400">Banner-Text (in der App sichtbar)</p>
            <input
              value={d.bannerText}
              onChange={(e) => setD({ ...d, bannerText: e.target.value })}
              maxLength={80}
              aria-label="Bannertext"
              className="h-10 w-full rounded-xl border border-mist-200 bg-white px-3.5 text-[13px] outline-none focus:border-royal-500"
            />
          </div>
          <div className="flex justify-between pt-1">
            <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Zurück
            </Button>
            <Button
              onClick={() => {
                if (!d.name.trim() || !(parseFloat(d.value.replace(',', '.')) > 0)) return;
                setStep(4);
              }}
            >
              Weiter zur Vorschau <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      )}

      {/* ── Schritt 4: Vorschau & Start ── */}
      {step === 4 && (
        <div>
          <p className="text-[13px] font-semibold text-slate-500">Fast fertig – so erscheint die Aktion in der Client-App:</p>
          {/* App-Banner-Vorschau */}
          <div className="mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-deep-950 via-deep-900 to-royal-800 p-5 shadow-float">
            <div className="flex items-center gap-3.5">
              <span className="text-[28px]">{occData?.emoji ?? '✨'}</span>
              <div className="flex-1">
                <p className="text-[15px] font-extrabold text-white">{d.bannerText.replace('X', d.value) || `${d.value} % Aktion`}</p>
                <p className="text-[11.5px] text-royal-100/70">
                  {d.name} ·{' '}
                  {new Date(d.startDate + 'T12:00').toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })} –{' '}
                  {new Date(d.endDate + 'T12:00').toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                </p>
              </div>
              <span className="rounded-full bg-white px-4 py-2 text-[13px] font-extrabold text-deep-900">Jetzt sparen</span>
            </div>
            {type === 'code' && (
              <p className="mt-3 text-center font-mono text-[15px] font-bold tracking-[0.3em] text-gold-400">{d.code}</p>
            )}
          </div>
          {/* Zusammenfassung */}
          <div className="mt-4 space-y-1.5 rounded-2xl bg-mist-50 p-4 text-[12.5px] text-slate-600">
            {[
              ['Typ', typeBadges[type ?? 'prozent'].label],
              ['Vergünstigung', type === 'versand' ? `Gratis-Versand ab ${eur(parseFloat(d.value.replace(',', '.')) || 0)}` : type === 'fix' ? `−${eur(parseFloat(d.value.replace(',', '.')) || 0)}` : `−${d.value} %`],
              ['Gilt für', d.scope === 'alles' ? 'Gesamter Shop' : d.scope === 'eigenmarken' ? 'GLAMLOOX® Eigenmarken' : d.category],
              ['Zeitraum', `${d.startDate} → ${d.endDate}`],
              type === 'code' ? ['Code', d.code] : null,
              type === 'bundle' ? ['Bundle', `${products.find((p) => p.id === d.bundleProduct)?.shortTitle} + ${courses.find((c) => c.id === d.bundleCourse)?.shortTitle}`] : null,
            ]
              .filter(Boolean)
              .map((row) => {
                const [k, v] = row as [string, string];
                return (
                  <p key={k}>
                    <span className="font-semibold text-deep-900">{k}:</span> {v}
                  </p>
                );
              })}
          </div>
          <div className="mt-5 flex justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Bearbeiten
            </Button>
            <Button onClick={() => { onCreate(build()); reset(); }}>
              <Sparkles className="h-4 w-4" aria-hidden /> Aktion jetzt starten
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
