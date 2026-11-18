import { useMemo, useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, MapPin, Video, Copy, Hourglass } from 'lucide-react';
import { useAdmin, eur, type AdminEvent } from '../store/AdminStore';
import { Card, PageHeader, Badge, Button, TextInput, Toggle, Modal, EmptyRow } from '../components/ui';

const daysUntil = (iso: string): number => Math.ceil((new Date(iso + 'T12:00').getTime() - Date.now()) / 86400000);

export default function Events() {
  const { events, updateEvent, addEvent, deleteEvent, duplicateEvent, toast } = useAdmin();
  const [addOpen, setAddOpen] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [freeOnly, setFreeOnly] = useState(false);
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
  const [dateValid, setDateValid] = useState(true);

  const sorted = useMemo(() => {
    let list = [...events];
    if (freeOnly) list = list.filter((e) => e.price === 0);
    list.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    if (!sortAsc) list.reverse();
    return list;
  }, [events, sortAsc, freeOnly]);

  // R6: Kapazität gesamt (aus seats-Text „Noch X von Y")
  const capacity = events.reduce((n, e) => {
    const m = e.seats.match(/von (\d+)/);
    return n + (m ? parseInt(m[1], 10) : 0);
  }, 0);

  return (
    <div className="anim-fade-up">
      <PageHeader
        title="Live-Events"
        sub={`${events.length} Events · Gesamt-Kapazität ${capacity} Plätze`}
        action={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden /> Event anlegen
          </Button>
        }
      />

      {/* R1+R5: Sortierung + Gratis-Filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => setSortAsc((v) => !v)}
          className="tap flex items-center gap-2 rounded-full border border-mist-200 bg-white px-4 py-2 text-[12.5px] font-bold text-deep-900 shadow-card"
        >
          <Hourglass className="h-4 w-4 text-royal-600" aria-hidden />
          {sortAsc ? 'Nächste zuerst' : 'Späteste zuerst'}
        </button>
        <button
          onClick={() => setFreeOnly((v) => !v)}
          className={`tap rounded-full px-4 py-2 text-[12.5px] font-bold ${freeOnly ? 'bg-gold-500 text-white' : 'border border-gold-400/40 bg-amber-50 text-amber-700'}`}
        >
          🎁 Nur kostenlose Events
        </button>
        <Badge className="bg-royal-50 text-royal-700">{sorted.length} angezeigt</Badge>
      </div>

      <div className="space-y-3.5">
        {sorted.map((e) => (
          <EventRow
            key={e.id}
            event={e}
            onPatch={(p) => updateEvent(e.id, p)}
            onDelete={() => { deleteEvent(e.id); toast('Event gelöscht', 'info'); }}
            onDuplicate={() => { duplicateEvent(e.id); toast('Event dupliziert', 'info'); }}
          />
        ))}
        {sorted.length === 0 && <Card><EmptyRow text="Keine Events für diesen Filter." /></Card>}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Neues Event anlegen">
        <div className="space-y-3">
          <TextInput value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} placeholder="Event-Titel *" ariaLabel="Event-Titel" />
          <TextInput value={draft.subtitle} onChange={(v) => setDraft({ ...draft, subtitle: v })} placeholder="Untertitel" ariaLabel="Untertitel" />
          <div className="flex gap-3">
            <div className="flex-1">
              {/* R8: natives Datum + Validierung */}
              <input
                type="date"
                value={draft.dateISO}
                onChange={(e) => {
                  setDraft({ ...draft, dateISO: e.target.value });
                  setDateValid(/^\d{4}-\d{2}-\d{2}$/.test(e.target.value));
                }}
                aria-label="Datum"
                className={`h-10 w-full rounded-xl border bg-white px-3 text-[13px] font-medium outline-none ${dateValid ? 'border-mist-200' : 'border-red-400 bg-red-50'}`}
              />
              {!dateValid && <p className="mt-1 text-[11px] font-semibold text-red-500">Ungültiges Datumsformat</p>}
            </div>
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
                if (!draft.title.trim() || !dateValid) {
                  toast('Titel & gültiges Datum sind Pflicht', 'error');
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

function EventRow({
  event,
  onPatch,
  onDelete,
  onDuplicate,
}: {
  event: AdminEvent;
  onPatch: (p: Partial<AdminEvent>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [title, setTitle] = useState(event.title);
  const [priceEdit, setPriceEdit] = useState(event.price.toString().replace('.', ','));
  const days = daysUntil(event.dateISO);
  const countdown = days < 0 ? 'Archiv' : days === 0 ? 'Heute!' : `in ${days} Tag${days === 1 ? '' : 'en'}`;
  const capMatch = event.seats.match(/von (\d+)/);
  const capTotal = capMatch ? parseInt(capMatch[1], 10) : 0;
  const capLeftMatch = event.seats.match(/Noch (\d+)/);
  const capLeft = capLeftMatch ? parseInt(capLeftMatch[1], 10) : capTotal;

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
            {/* R4: Inline-Titel */}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => title.trim() && title !== event.title && onPatch({ title: title.trim() })}
              aria-label={`Titel von ${event.title}`}
              className="min-w-[140px] flex-1 rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-[14.5px] font-bold text-deep-900 outline-none hover:border-mist-200 focus:border-royal-500"
            />
            {/* R9: Typ-Farbe */}
            {event.online ? (
              <Badge className="bg-royal-600 text-white">
                <Video className="mr-1 h-3 w-3" aria-hidden /> Online
              </Badge>
            ) : (
              <Badge className="bg-emerald-600 text-white">
                <MapPin className="mr-1 h-3 w-3" aria-hidden /> Vor Ort
              </Badge>
            )}
            {event.price === 0 && <Badge className="bg-gold-400/20 text-gold-500">Kostenlos</Badge>}
            {/* R10: Countdown-Badge */}
            <Badge className={days < 0 ? 'bg-mist-200 text-slate-500' : days <= 7 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}>
              {countdown}
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-[12px] text-slate-400">
            {event.time} · {event.location}
          </p>
          {/* R3: Kapazitäts-Progressbar */}
          {capTotal > 0 && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-mist-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-royal-400 to-royal-600"
                  style={{ width: `${((capTotal - capLeft) / capTotal) * 100}%` }}
                />
              </div>
              <span className="text-[10.5px] font-semibold text-slate-400">
                {capTotal - capLeft}/{capTotal} belegt
              </span>
            </div>
          )}
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
            onClick={onDuplicate}
            aria-label={`${event.title} duplizieren`}
            className="tap flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-royal-50 hover:text-royal-600"
          >
            <Copy className="h-4 w-4" aria-hidden />
          </button>
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
