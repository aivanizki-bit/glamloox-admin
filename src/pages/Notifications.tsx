import { useState } from 'react';
import { SendHorizontal, Trash2, Radio, Users, GraduationCap, ShoppingBag, Bell, Copy, Smartphone } from 'lucide-react';
import { useAdmin, type AdminNotification } from '../store/AdminStore';
import { Card, PageHeader, Badge, Button, TextInput, EmptyRow } from '../components/ui';

const templates = [
  { title: 'Wochenend-Sale 🎉', body: '20 % auf alle Booster – nur bis Sonntag! Jetzt im Shop sichern.' },
  { title: 'Event-Erinnerung 📅', body: 'Unser nächstes Live-Webinar startet bald – sichere dir deinen Platz!' },
  { title: 'Neuer Academy-Kurs 🎓', body: 'Frisch veröffentlicht: Vertiefe dein Lash-Wissen mit dem neuen Kurs.' },
];
const targets: { id: AdminNotification['target']; label: string; icon: typeof Users; reach: number }[] = [
  { id: 'alle', label: 'Alle', icon: Bell, reach: 4200 },
  { id: 'kunden', label: 'Kundinnen', icon: ShoppingBag, reach: 1800 },
  { id: 'community', label: 'Community', icon: Users, reach: 1400 },
  { id: 'academy', label: 'Academy', icon: GraduationCap, reach: 1000 },
];

export default function Notifications() {
  const { outbox, sendNotification, deleteNotification, toast } = useAdmin();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<AdminNotification['target']>('alle');

  return (
    <div className="anim-fade-up">
      <PageHeader title="Mitteilungen" sub="Push-Kampagnen an die App-Community senden (Demo-Outbox)" />

      {/* Kampagne erstellen */}
      <Card className="mb-5 p-5">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-deep-900">
          <Radio className="h-[18px] w-[18px] text-royal-600" aria-hidden /> Neue Mitteilung
        </h2>
        {/* R1: Live-Push-Vorschau */}
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-mist-200 bg-mist-50 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-royal-600 text-white">
            <Smartphone className="h-[18px] w-[18px]" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">So sieht die Push-Mitteilung aus</p>
            <div className="mt-1.5 rounded-xl bg-white px-3.5 py-2.5 shadow-card">
              <p className="text-[12.5px] font-bold text-deep-950">{title || 'Titel der Mitteilung…'}</p>
              <p className="text-[12px] text-slate-500">{body || 'Inhalt der Mitteilung…'}</p>
            </div>
          </div>
        </div>

        {/* R3: Vorlagen */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-[12px] font-semibold text-slate-400">Vorlagen:</span>
          {templates.map((t) => (
            <button
              key={t.title}
              onClick={() => { setTitle(t.title); setBody(t.body); }}
              className="tap rounded-full border border-royal-200 bg-royal-50 px-3 py-1.5 text-[11.5px] font-bold text-royal-700"
            >
              {t.title}
            </button>
          ))}
        </div>

        <div className="mt-3 space-y-3">
          <TextInput value={title} onChange={setTitle} placeholder="Titel, z. B. „Neuheit im Shop“ *" ariaLabel="Mitteilungstitel" />
          <div className="relative">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              maxLength={200}
              placeholder="Inhalt der Mitteilung… (max. 200 Zeichen)"
              aria-label="Mitteilungstext"
              className="w-full resize-none rounded-xl border border-mist-200 bg-white p-3.5 pr-24 text-[13px] leading-relaxed text-deep-950 outline-none placeholder:text-slate-400 focus:border-royal-500"
            />
            {/* R2: Emoji-Picker */}
            <div className="absolute bottom-3 right-3 flex gap-0.5">
              {['💙', '🎉', '📅', '✨'].map((em) => (
                <button
                  key={em}
                  onClick={() => setBody((b) => b + em)}
                  aria-label={'Emoji ' + em + ' einfügen'}
                  className="tap flex h-7 w-7 items-center justify-center rounded-full text-[14px] hover:bg-mist-100"
                >
                  {em}
                </button>
              ))}
            </div>
            {/* R9: Zeichen-Fortschritt-Farbe */}
            <p className="absolute right-3 top-3 text-[10px] font-bold" style={{ color: body.length > 180 ? '#dc2626' : body.length > 120 ? '#d97706' : '#94a3b8' }}>
              {body.length}/200
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-semibold text-slate-400">Zielgruppe:</span>
            {targets.map(({ id, label, icon: Icon, reach }) => (
              <button
                key={id}
                onClick={() => setTarget(id)}
                title={reach.toLocaleString('de-DE') + ' Empfängerinnen (Demo)'}
                className={`tap flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${
                  target === id ? 'bg-deep-900 text-white' : 'border border-mist-200 bg-white text-slate-500'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
                <span className="text-[10px] font-semibold opacity-60">· {reach.toLocaleString('de-DE')}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              Demo: Mitteilungen landen in der Outbox – im echten Ausbau würde hier der Push-Dienst angebunden.
            </p>
            <Button
              onClick={() => {
                if (!title.trim() || !body.trim()) {
                  toast('Titel und Inhalt sind Pflichtfelder', 'error');
                  return;
                }
                if (confirm('Kampagne an ' + (targets.find((t) => t.id === target)?.reach ?? 0).toLocaleString('de-DE') + ' Empfängerinnen senden? (Demo)')) {
                  sendNotification(title.trim(), body.trim(), target);
                  setTitle('');
                  setBody('');
                  toast('Kampagne gesendet ✓');
                }
              }}
            >
              <SendHorizontal className="h-4 w-4" aria-hidden /> Senden
            </Button>
          </div>
        </div>
      </Card>

      {/* Outbox */}
      <h2 className="mb-3 text-[16px] font-bold tracking-tight text-deep-900">
        Gesendet · {outbox.length}
      </h2>
      <div className="space-y-3">
        {outbox.map((n) => (
          <Card key={n.id} className="flex flex-wrap items-center gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-royal-50 text-royal-600">
              <Bell className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <div className="min-w-[200px] flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[14px] font-bold text-deep-900">{n.title}</p>
                <Badge className="bg-royal-50 text-royal-700 capitalize">{n.target}</Badge>
              </div>
              <p className="mt-0.5 text-[12.5px] text-slate-500">{n.body}</p>
              <p className="mt-1 text-[11px] text-slate-400">
                Gesendet am {new Date(n.sentISO + 'T12:00').toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => { setTitle(n.title); setBody(n.body); setTarget(n.target); toast('Kampagne zum Bearbeiten geladen', 'info'); }}
              aria-label={'Kampagne ' + n.title + ' wiederverwenden'}
              className="tap flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-royal-50 hover:text-royal-600"
            >
              <Copy className="h-4 w-4" aria-hidden />
            </button>
            <button
              onClick={() => { deleteNotification(n.id); toast('Mitteilung entfernt', 'info'); }}
              aria-label={'Mitteilung ' + n.title + ' löschen'}
              className="tap flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </Card>
        ))}
        {outbox.length === 0 && <Card><EmptyRow text="Noch keine Mitteilungen gesendet." /></Card>}
      </div>
    </div>
  );
}
