import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-mist-200 bg-white shadow-card ${className}`}>{children}</div>;
}

export function PageHeader({ title, sub, action, eyebrow }: { title: string; sub?: string; action?: ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {/* Проход 6: бренд-надзаголовок */}
        <p className="brand-eyebrow">{eyebrow ?? 'GLAMLOOX Admin'}</p>
        <h1 className="mt-1 text-[24px] font-extrabold tracking-tight text-deep-950">{title}</h1>
        {sub && <p className="mt-1 text-[13.5px] text-slate-500">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/** Проход 7: мини-спарклайн для KPI-карт */
export function Sparkline({ points, className = '' }: { points: number[]; className?: string }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const path = points
    .map((p, i) => `${(i / (points.length - 1)) * 100},${28 - ((p - min) / range) * 24}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 30" className={`h-8 w-full ${className}`} preserveAspectRatio="none" aria-hidden>
      <polyline points={path} fill="none" stroke="#2E5BF0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points.length > 1 ? 100 : 0} cy={28 - ((points[points.length - 1] - min) / range) * 24} r="2.5" fill="#2E5BF0" />
    </svg>
  );
}

export function Stat({
  icon,
  label,
  value,
  hint,
  tone = 'royal',
  spark,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: 'royal' | 'gold' | 'emerald';
  spark?: number[];
}) {
  const tones = {
    royal: { chip: 'bg-gradient-to-br from-royal-500 to-deep-900 text-white', ring: 'bg-royal-50' },
    gold: { chip: 'bg-gradient-to-br from-gold-400 to-gold-500 text-white', ring: 'bg-amber-50' },
    emerald: { chip: 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white', ring: 'bg-emerald-50' },
  }[tone];
  return (
    <Card className="relative overflow-hidden p-4">
      {/* Угол-акцент как в App-карточках */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-royal-50" aria-hidden />
      <div className="relative flex items-center gap-3.5">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-card ${tones.chip}`}>{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
          <p className="text-[22px] font-extrabold leading-tight text-deep-950 tabular-nums">{value}</p>
          {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
          {spark && <Sparkline points={spark} className="mt-1" />}
        </div>
      </div>
    </Card>
  );
}

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${className}`}>
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled,
  type = 'button',
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'danger' | 'dark';
  size?: 'sm' | 'md';
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-royal-600 to-royal-700 text-white hover:from-royal-700 hover:to-royal-800 shadow-card',
    ghost: 'border border-mist-200 bg-white text-deep-900 hover:bg-mist-50 shadow-card',
    danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
    dark: 'bg-deep-900 text-white hover:bg-deep-950 shadow-card',
  };
  const sizes = { sm: 'h-8 px-3 text-[12px]', md: 'h-10 px-4 text-[13px]' };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`tap inline-flex items-center justify-center gap-1.5 rounded-xl font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  type = 'text',
  className = '',
  min,
  max,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  type?: string;
  className?: string;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={`h-10 rounded-xl border border-mist-200 bg-white px-3.5 text-[13px] font-medium text-deep-950 outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-royal-500 ${className}`}
    />
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      onClick={() => onChange(!on)}
      aria-pressed={on}
      aria-label={label}
      className={`tap relative h-[24px] w-[44px] shrink-0 rounded-full transition-colors ${on ? 'bg-royal-600' : 'bg-mist-200'}`}
    >
      <span className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${on ? 'left-[23px]' : 'left-[3px]'}`} />
    </button>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="anim-fade-in absolute inset-0 bg-deep-950/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div ref={ref} className="anim-fade-up relative w-full max-w-lg overflow-hidden rounded-3xl border border-mist-200 bg-white shadow-float">
        <div className="h-1.5 w-full bg-gradient-to-r from-royal-500 to-deep-900" aria-hidden />
        <div className="p-5 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-extrabold tracking-tight text-deep-950">{title}</h2>
          <button onClick={onClose} aria-label="Dialog schließen" className="tap flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-mist-100">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        {children}
        </div>
      </div>
    </div>
  );
}

export function EmptyRow({ text }: { text: string }) {
  return <p className="px-4 py-10 text-center text-[13px] text-slate-400">{text}</p>;
}

export function Toasts({ toasts, dismiss }: { toasts: { id: number; msg: string; kind: string }[]; dismiss: (id: number) => void }) {
  const tones: Record<string, string> = {
    success: 'bg-deep-950 text-white',
    info: 'bg-deep-900 text-white',
    error: 'bg-red-600 text-white',
  };
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`anim-fade-up pointer-events-auto cursor-pointer rounded-2xl px-4 py-2.5 text-[13px] font-semibold shadow-float ${tones[t.kind] ?? tones.info}`}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
