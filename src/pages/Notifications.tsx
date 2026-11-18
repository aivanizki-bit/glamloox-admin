import { useState } from 'react';
import { SendHorizontal, Trash2, Radio, Users, GraduationCap, ShoppingBag, Bell } from 'lucide-react';
import { useAdmin, type AdminNotification } from '../store/AdminStore';
import { Card, PageHeader, Badge, Button, TextInput, EmptyRow } from '../components/ui';

const targets: { id: AdminNotification['target']; label: string; icon: typeof Users }[] = [
  { id: 'alle', label: 'Alle', icon: Bell },
  { id: 'kunden', label: 'Kundinnen', icon: ShoppingBag },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'academy', label: 'Academy', icon: GraduationCap },
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
        <div className="mt-4 space-y-3">
          <TextInput value={title} onChange={setTitle} placeholder="Titel, z. B. „Neuheit im Shop“ *" ariaLabel="Mitteilungstitel" />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={200}
            placeholder="Inhalt der Mitteilung… (max. 200 Zeichen)"
            aria-label="Mitteilungstext"
            className="w-full resize-none rounded-xl border border-mist-200 bg-white p-3.5 text-[13px] leading-relaxed text-deep-950 outline-none placeholder:text-slate-400 focus:border-royal-500"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-semibold text-slate-400">Zielgruppe:</span>
            {targets.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTarget(id)}
                className={`tap flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${
                  target === id ? 'bg-deep-900 text-white' : 'border border-mist-200 bg-white text-slate-500'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
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
                sendNotification(title.trim(), body.trim(), target);
                setTitle('');
                setBody('');
                toast('Kampagne gesendet ✓');
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
              onClick={() => { deleteNotification(n.id); toast('Mitteilung entfernt', 'info'); }}
              aria-label={`Mitteilung ${n.title} löschen`}
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
