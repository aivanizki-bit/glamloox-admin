import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-mist-200 bg-white shadow-card ${className}`}>{children}</div>;
}

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[24px] font-extrabold tracking-tight text-deep-950">{title}</h1>
        {sub && <p className="mt-1 text-[13.5px] text-slate-500">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ icon, label, value, hint, tone = 'royal' }: { icon: ReactNode; label: string; value: string; hint?: string; tone?: 'royal' | 'gold' | 'emerald' }) {
  const tones = {
    royal: 'bg-royal-50 text-royal-600',
    gold: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3.5">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</span>
        <div className="min-w-0">
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="text-[22px] font-extrabold leading-tight text-deep-950 tabular-nums">{value}</p>
          {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
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
    primary: 'bg-royal-600 text-white hover:bg-royal-700 shadow-card',
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
      <div ref={ref} className="anim-fade-up relative w-full max-w-lg rounded-3xl border border-mist-200 bg-white p-5 shadow-float">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-extrabold tracking-tight text-deep-950">{title}</h2>
          <button onClick={onClose} aria-label="Dialog schließen" className="tap flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-mist-100">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        {children}
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
