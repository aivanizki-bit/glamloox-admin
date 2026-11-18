import { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, MapPin, Video } from 'lucide-react';
import { useAdmin, eur, type AdminEvent } from '../store/AdminStore';
import { Card, PageHeader, Badge, Button, TextInput, Toggle, Modal, EmptyRow } from '../components/ui';

export default function Events() {
  const { events, updateEvent, addEvent, deleteEvent, toast } = useAdmin();
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState({
    title: '',
    subtitle: 'Live-Session der GLAMLOOX Academy',
    dateISO: '2027-02-05',
    time: '18:00 – 19:30 Uhr',
    location: 'Online (Link per E-Mail)',
    online: true,
    price: '0',
    seats: 'Noch 50 von 100 Plätzen',
  });

  return (
    <div className="anim-fade-up">
      <PageHeader
        title="Live-Events"
        sub={`${events.length} Events · ${events.filter((e) => e.published).length} veröffentlicht`}
        action={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden /> Event anlegen
          </Button>
        }
      />

      <div className="space-y-3.5">
        {events.map((e) => (
          <EventRow key={e.id} event={e} onPatch={(p) => updateEvent(e.id, p)} onDelete={() => { deleteEvent(e.id); toast('Event gelöscht', 'info'); }} />
        ))}
        {events.length === 0 && <Card><EmptyRow text="Keine Events angelegt." /></Card>}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Neues Event anlegen">
        <div className="space-y-3">
          <TextInput value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} placeholder="Event-Titel *" ariaLabel="Event-Titel" />
          <TextInput value={draft.subtitle} onChange={(v) => setDraft({ ...draft, subtitle: v })} placeholder="Untertitel" ariaLabel="Untertitel" />
          <div className="flex gap-3">
            <TextInput value={draft.dateISO} onChange={(v) => setDraft({ ...draft, dateISO: v })} placeholder="Datum (JJJJ-MM-TT)" ariaLabel="Datum" className="flex-1" />
            <TextInput value={draft.time} onChange={(v) => setDraft({ ...draft, time: v })} placeholder="Uhrzeit" ariaLabel="Uhrzeit" className="flex-1" />
          </div>
          <div className="flex items-center gap-3">
            <TextInput value={draft.location} onChange={(v) => setDraft({ ...draft, location: v })} placeholder="Ort" ariaLabel="Ort" className="flex-1" />
            <div className="flex items-center gap-2 rounded-xl border border-mist-200 px-3 py-2.5">
              {draft.online ? <Video className="h-4 w-4 text-royal-600" aria-hidden /> : <MapPin className="h-4 w-4 text-royal-600" aria-hidden />}
              <Toggle on={draft.online} onChange={(v) => setDraft({ ...draft, online: v, location: v ? 'Online (Link per E-Mail)' : 'Vor Ort' })} label="Online-Event" />
              <span className="text-[12px] font-semibold text-slate-500">{draft.online ? 'Online' : 'Vor Ort'}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <TextInput value={draft.price} onChange={(v) => setDraft({ ...draft, price: v })} placeholder="Preis (0 = kostenlos)" ariaLabel="Preis" className="flex-1" />
            <TextInput value={draft.seats} onChange={(v) => setDraft({ ...draft, seats: v })} placeholder="Plätze" ariaLabel="Plätze" className="flex-1" />
          </div>
          <div className="flex justify-end gap-2.5 pt-1">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                if (!draft.title.trim()) {
                  toast('Titel ist Pflichtfeld', 'error');
                  return;
                }
                const price = parseFloat(draft.price.replace(',', '.'));
                addEvent({ ...draft, price: Number.isNaN(price) ? 0 : price });
                setAddOpen(false);
                toast('Event angelegt ✓');
              }}
            >
              Anlegen
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function EventRow({ event, onPatch, onDelete }: { event: AdminEvent; onPatch: (p: Partial<AdminEvent>) => void; onDelete: () => void }) {
  const [priceEdit, setPriceEdit] = useState(event.price.toString().replace('.', ','));
  return (
    <Card className={`p-4 ${event.published ? '' : 'opacity-60'}`}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-[54px] w-[50px] shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-b from-royal-600 to-deep-900 text-white">
          <span className="text-[9px] font-bold uppercase tracking-wide opacity-80">
            {new Date(event.dateISO + 'T12:00').toLocaleDateString('de-DE', { month: 'short' })}
          </span>
          <span className="text-[18px] font-extrabold leading-none">{event.dateISO.slice(-2)}</span>
        </div>
        <div className="min-w-[180px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[14.5px] font-bold text-deep-900">{event.title}</p>
            {event.online ? <Badge className="bg-royal-50 text-royal-700">Online</Badge> : <Badge className="bg-emerald-50 text-emerald-700">Vor Ort</Badge>}
            {event.price === 0 && <Badge className="bg-gold-400/20 text-gold-500">Kostenlos</Badge>}
          </div>
          <p className="mt-0.5 truncate text-[12px] text-slate-400">
            {event.time} · {event.location}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11.5px] font-semibold text-slate-400">Preis</span>
          <input
            value={priceEdit}
            onChange={(e) => {
              setPriceEdit(e.target.value);
              const n = parseFloat(e.target.value.replace(',', '.').replace(/[^\d.]/g, ''));
              if (!Number.isNaN(n) && n >= 0) onPatch({ price: Math.round(n * 100) / 100 });
            }}
            aria-label={`Preis von ${event.title}`}
            className="h-9 w-[80px] rounded-lg border border-mist-200 bg-white px-2.5 text-[12.5px] font-bold tabular-nums text-deep-950 outline-none focus:border-royal-500"
          />
          <span className="text-[12px] font-bold text-deep-950">{eur(event.price)}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
            {event.published ? <Eye className="h-4 w-4 text-royal-600" aria-hidden /> : <EyeOff className="h-4 w-4 text-slate-400" aria-hidden />}
            {event.published ? 'Live' : 'Entwurf'}
          </span>
          <Toggle on={event.published} onChange={(v) => onPatch({ published: v })} label={`${event.title} veröffentlicht`} />
          <button
            onClick={onDelete}
            aria-label={`${event.title} löschen`}
            className="tap flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </Card>
  );
}
