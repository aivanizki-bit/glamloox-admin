import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Lock, User as UserIcon, Eye, EyeOff, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAdmin } from '../store/AdminStore';
import { Button } from '../components/ui';

export default function Login() {
  const { authed, login } = useAdmin();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [remember, setRemember] = useState(true);
  const [shake, setShake] = useState(0);

  if (authed) return <Navigate to="/" replace />;

  const submit = () => {
    if (!login(user, pass, remember)) {
      setError(true);
      setShake((n) => n + 1);
      setTimeout(() => setError(false), 2600);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-deep-950 p-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(1100px 700px at 15% -10%, rgba(46,91,240,0.3), transparent 60%), radial-gradient(900px 600px at 90% 110%, rgba(122,150,248,0.18), transparent 55%), linear-gradient(160deg, #061238 0%, #0A1E5A 55%, #14267A 100%)',
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)', backgroundSize: '26px 26px' }} aria-hidden />

      <div key={shake} className={shake > 0 ? 'anim-shake relative w-full max-w-[400px]' : 'relative w-full max-w-[400px]'}>
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-royal-400 to-royal-600 text-[24px] font-extrabold text-white shadow-float">
            A
          </div>
          <p className="mt-3 text-[24px] font-extrabold tracking-tight text-white">
            GLAM<span className="text-royal-300">LOOX</span>
            <span className="ml-0.5 align-super text-[10px] font-bold text-royal-300">®</span>
          </p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.25em] text-royal-300/70">Admin Console</p>
          <div className="mt-3 flex justify-center gap-2">
            {['Ohne Hormone', 'Vegan', 'Tierversuchsfrei'].map((u) => (
              <span key={u} className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/80">
                💙 {u}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/[0.08] p-6 backdrop-blur-xl">
          <h1 className="text-[18px] font-extrabold tracking-tight text-white">Anmelden</h1>
          <p className="mt-1 text-[12.5px] text-royal-100/70">Management-Konsole für den App-Prototyp</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="mt-5 space-y-3"
          >
            <div className="flex h-12 items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 focus-within:border-royal-400">
              <UserIcon className="h-[18px] w-[18px] shrink-0 text-royal-300" aria-hidden />
              <input
                autoFocus
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="Benutzername"
                aria-label="Benutzername"
                autoComplete="username"
                className="w-full bg-transparent text-[14px] font-medium text-white outline-none placeholder:text-white/40"
              />
            </div>
            <div className={`flex h-12 items-center gap-3 rounded-xl border px-4 focus-within:border-royal-400 ${error ? 'border-red-400 bg-red-500/10' : 'border-white/20 bg-white/10'}`}>
              <Lock className="h-[18px] w-[18px] shrink-0 text-royal-300" aria-hidden />
              <input
                type={showPass ? 'text' : 'password'}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                onKeyUp={(e) => setCapsOn(e.getModifierState?.('CapsLock') ?? false)}
                placeholder="Passwort"
                aria-label="Passwort"
                autoComplete="current-password"
                className="w-full bg-transparent text-[14px] font-medium text-white outline-none placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Passwort verbergen' : 'Passwort anzeigen'}
                className="tap text-white/50 hover:text-white"
              >
                {showPass ? <EyeOff className="h-[18px] w-[18px]" aria-hidden /> : <Eye className="h-[18px] w-[18px]" aria-hidden />}
              </button>
            </div>

            {capsOn && (
              <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Feststelltaste ist aktiv
              </p>
            )}

            {error && (
              <p className="anim-fade-in rounded-xl bg-red-500/20 px-3.5 py-2.5 text-[12.5px] font-semibold text-red-200">
                Zugangsdaten falsch – bitte prüfe Benutzername & Passwort.
              </p>
            )}

            <label className="flex cursor-pointer items-center gap-2.5 px-1 py-0.5">
              <span
                onClick={() => setRemember((v) => !v)}
                className={`flex h-[20px] w-[36px] shrink-0 rounded-full transition-colors ${remember ? 'bg-royal-500' : 'bg-white/20'}`}
              >
                <span className={`mt-[2px] h-4 w-4 rounded-full bg-white shadow transition-all ${remember ? 'ml-[18px]' : 'ml-[2px]'}`} />
              </span>
              <span className="text-[12px] text-white/70">Auf diesem Gerät angemeldet bleiben</span>
            </label>

            <Button type="submit" className="h-12 w-full rounded-xl text-[14.5px]">
              <ShieldCheck className="h-[18px] w-[18px]" aria-hidden /> Anmelden
            </Button>
          </form>

          <div className="mt-5 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-royal-300/80">Demo-Zugang</p>
            <p className="mt-1 font-mono text-[13px] text-white/80">admin · glam</p>
          </div>
        </div>

        <a
          href="https://glamloox-app.vercel.app"
          target="_blank"
          rel="noreferrer"
          className="tap mx-auto mt-5 flex w-fit items-center gap-2 text-[12.5px] font-semibold text-white/50 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" aria-hidden /> Client-App ansehen
        </a>
        <p className="mt-3 text-center text-[10px] text-white/30">
          Interactive Concept Demo · v2.1 · Keine echten Kundendaten
        </p>
      </div>
    </div>
  );
}
