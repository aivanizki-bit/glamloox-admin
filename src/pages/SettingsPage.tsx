import { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, ExternalLink, Info, ShieldCheck, CheckCircle2, XCircle, Package as PackageIcon, ShoppingBag as OrderIcon, Users as PostIcon, CalendarDays as EventIcon, Keyboard as KeyboardIcon } from 'lucide-react';
import { useAdmin } from '../store/AdminStore';
import { Stat } from '../components/ui';
import { Card, PageHeader, Button } from '../components/ui';

export default function SettingsPage() {
  const { resetAll, exportJSON, importJSON, toast, adminName, setAdminName, adminPass, setAdminPass, products, orders, posts, events, courses } = useAdmin();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importState, setImportState] = useState<'idle' | 'ok' | 'error'>('idle');
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="anim-fade-up max-w-3xl">
      <PageHeader title="Einstellungen" sub="System, Datenübernahme und Demo-Verwaltung" />

      {/* Datenübernahme */}
      <Card className="mb-4 overflow-hidden">
        <div className="border-b border-mist-200 bg-mist-50 px-5 py-3">
          <h2 className="text-[14px] font-bold text-deep-900">Datenübernahme (JSON-Brücke)</h2>
        </div>
        <div className="p-5">
          <p className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-slate-500">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-royal-500" aria-hidden />
            Die Admin-Konsole verwaltet die Demo-Daten lokal. Mit dem JSON-Export kannst du den kompletten
            Datenstand sichern oder in die Client-App übernehmen (dort unter Einstellungen → „Admin-Daten
            übernehmen“ einfügen). So bleiben beide Prototypen synchron.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button
              variant="dark"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(exportJSON());
                  toast('JSON in die Zwischenablage kopiert ✓');
                } catch {
                  toast('Kopieren blockiert – nutze den Download', 'error');
                }
              }}
            >
              JSON kopieren
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                const blob = new Blob([exportJSON()], { type: 'application/json' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'glamloox-admin-daten.json';
                a.click();
                toast('Datei heruntergeladen');
              }}
            >
              <Download className="h-4 w-4" aria-hidden /> JSON herunterladen
            </Button>
            <Button variant="ghost" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" aria-hidden /> JSON importieren
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const ok = importJSON(String(reader.result));
                  setImportState(ok ? 'ok' : 'error');
                  toast(ok ? 'Daten importiert ✓' : 'Ungültiges JSON', ok ? 'success' : 'error');
                  setTimeout(() => setImportState('idle'), 3000);
                };
                reader.readAsText(file);
              }}
            />
            {importState === 'ok' && (
              <span className="anim-fade-in flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" aria-hidden /> Import erfolgreich
              </span>
            )}
            {importState === 'error' && (
              <span className="anim-fade-in flex items-center gap-1.5 text-[12.5px] font-bold text-red-600">
                <XCircle className="h-4 w-4" aria-hidden /> Import fehlgeschlagen
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Demo zurücksetzen */}
      <Card className="mb-4 overflow-hidden">
        <div className="border-b border-mist-200 bg-mist-50 px-5 py-3">
          <h2 className="text-[14px] font-bold text-deep-900">Demo-Daten zurücksetzen</h2>
        </div>
        <div className="p-5">
          {!confirmReset ? (
            <Button variant="ghost" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="h-4 w-4" aria-hidden /> Auf Auslieferungszustand zurücksetzen
            </Button>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-[13px] font-semibold text-amber-800">
                Wirklich alle Admin-Änderungen verwerfen und die Demo-Daten neu aufsetzen?
              </p>
              <div className="mt-3 flex gap-2.5">
                <Button variant="danger" onClick={() => { resetAll(); setConfirmReset(false); toast('Demo-Daten zurückgesetzt', 'info'); }}>
                  Ja, zurücksetzen
                </Button>
                <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                  Abbrechen
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Admin-Profil + Passwort */}
      <Card className="mb-4 overflow-hidden">
        <div className="border-b border-mist-200 bg-mist-50 px-5 py-3">
          <h2 className="text-[14px] font-bold text-deep-900">Admin-Konto</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <div>
            <p className="text-[11.5px] font-semibold text-slate-400">Anzeigename</p>
            <input
              defaultValue={adminName}
              onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== adminName) { setAdminName(v); toast('Name gespeichert ✓'); } }}
              aria-label="Admin-Anzeigename"
              className="mt-1 h-10 w-full rounded-xl border border-mist-200 bg-white px-3 text-[13.5px] font-semibold text-deep-950 outline-none focus:border-royal-500"
            />
          </div>
          <div>
            <p className="text-[11.5px] font-semibold text-slate-400">Passwort ändern (Demo)</p>
            <div className="mt-1 flex gap-2">
              <input
                type="password"
                defaultValue={adminPass}
                onBlur={(e) => { const v = e.target.value; if (v && v !== adminPass) { setAdminPass(v); toast('Passwort geändert ✓ – gilt beim nächsten Login'); } }}
                aria-label="Neues Passwort"
                className="h-10 w-full rounded-xl border border-mist-200 bg-white px-3 text-[13.5px] font-semibold text-deep-950 outline-none focus:border-royal-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Datenstatistik */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<PackageIcon className="h-5 w-5" aria-hidden />} label="Produkte" value={products.length.toString()} />
        <Stat icon={<OrderIcon className="h-5 w-5" aria-hidden />} label="Bestellungen" value={orders.length.toString()} tone="emerald" />
        <Stat icon={<PostIcon className="h-5 w-5" aria-hidden />} label="Beiträge" value={posts.length.toString()} tone="gold" />
        <Stat icon={<EventIcon className="h-5 w-5" aria-hidden />} label="Events + Kurse" value={(events.length + courses.length).toString()} />
      </div>

      {/* System-Info + Tastatur */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card className="p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">System-Info</p>
          <p className="mt-1 text-[12px] text-slate-500">
            Admin v2.1 · Daten: {Math.round(JSON.stringify({ products, orders }).length / 1024)} KB lokal gespeichert
          </p>
        </Card>
        <Card className="p-3.5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            <KeyboardIcon className="h-3.5 w-3.5" aria-hidden /> Tastatur
          </p>
          <p className="mt-1 text-[12px] text-slate-500">„Esc" schließt Dialoge · „Enter" sendet Formulare</p>
        </Card>
      </div>

      {/* Links & Info */}
      <Card className="overflow-hidden">
        <div className="border-b border-mist-200 bg-mist-50 px-5 py-3">
          <h2 className="text-[14px] font-bold text-deep-900">Prototyp-Links</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ['Client-App (Prototyp)', 'https://glamloox-app.vercel.app'],
              ['glamloox.net (Shop)', 'https://glamloox.net'],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="tap flex items-center justify-between rounded-2xl border border-mist-200 bg-mist-50 px-4 py-3.5 hover:border-royal-200"
              >
                <span>
                  <span className="block text-[13.5px] font-bold text-deep-900">{label}</span>
                  <span className="block truncate text-[11.5px] text-slate-400">{href}</span>
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 text-royal-600" aria-hidden />
              </a>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-royal-50 p-3.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-royal-600" aria-hidden />
            <p className="text-[11.5px] leading-relaxed text-slate-500">
              Diese Konsole ist Teil des interaktiven Concept-Demo. Verwaltung, Preise und Kennzahlen sind
              Demo-Daten; es besteht keine Verbindung zu echten Shop- oder Kundensystemen.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
