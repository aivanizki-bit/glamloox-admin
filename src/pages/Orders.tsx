import { useMemo, useState } from 'react';
import { Search, Eye, Download, ReceiptText, ShoppingBag as ShoppingBagIcon, Euro } from 'lucide-react';
import { Stat } from '../components/ui';
import { useAdmin, eur, statusColor, type OrderStatus } from '../store/AdminStore';
import { Card, PageHeader, Badge, Modal, EmptyRow, Button } from '../components/ui';
import { productByIdSafe } from '../store/AdminStore';

const statuses: OrderStatus[] = ['bestätigt', 'versandt', 'geliefert', 'storniert'];

export default function Orders() {
  const { orders, setOrderStatus, toast } = useAdmin();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'alle' | OrderStatus>('alle');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [sort, setSort] = useState<'datum' | 'summe'>('datum');
  const [page, setPage] = useState(0);
  const PER_PAGE = 8;

  const filtered = useMemo(() => {
    let list = orders;
    if (status !== 'alle') list = list.filter((o) => o.status === status);
    if (q.trim()) {
      const query = q.trim().toLowerCase();
      list = list.filter((o) => o.id.toLowerCase().includes(query) || o.customer.toLowerCase().includes(query));
    }
    list = [...list].sort((a, b) => (sort === 'datum' ? b.dateISO.localeCompare(a.dateISO) : b.total - a.total));
    return list;
  }, [orders, status, q, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const pageItems = filtered.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);
  const totalSum = orders.filter((o) => o.status !== 'storniert').reduce((n, o) => n + o.total, 0);
  const avg = orders.length ? totalSum / orders.filter((o) => o.status !== 'storniert').length : 0;

  const exportCSV = () => {
    const rows = [['ID', 'Kundin', 'Datum', 'Status', 'Summe'].join(';')];
    filtered.forEach((o) => rows.push([o.id, o.customer, o.dateISO, o.status, o.total.toString().replace('.', ',')].join(';')));
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'glamloox-bestellungen.csv';
    a.click();
    toast('CSV exportiert (' + filtered.length + ')');
  };

  const detail = orders.find((o) => o.id === detailId);

  return (
    <div className="anim-fade-up">
      <PageHeader title="Bestellungen" sub={`${orders.length} Demo-Bestellungen · Status direkt änderbar`} />

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<ShoppingBagIcon className="h-5 w-5" aria-hidden />} label="Bestellungen" value={orders.length.toString()} />
        <Stat icon={<Euro className="h-5 w-5" aria-hidden />} label="Gesamtsumme" value={eur(totalSum)} tone="emerald" />
        <Stat icon={<Euro className="h-5 w-5" aria-hidden />} label="Ø Bestellwert" value={eur(avg)} />
        <Stat icon={<Eye className="h-5 w-5" aria-hidden />} label="Stornoquote" value={orders.length ? Math.round((orders.filter((o) => o.status === 'storniert').length / orders.length) * 100) + ' %' : '0 %'} tone="gold" />
      </div>

      <Card className="mb-4 flex flex-wrap items-center gap-2.5 p-3.5">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-mist-200 bg-mist-50 px-3">
          <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Bestellnummer oder Kundin…"
            aria-label="Bestellungen durchsuchen"
            className="h-10 w-full bg-transparent text-[13px] font-medium outline-none placeholder:text-slate-400"
          />
        </div>
        {(['alle', ...statuses] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`tap rounded-full px-3.5 py-1.5 text-[12.5px] font-bold capitalize ${status === s ? 'bg-deep-900 text-white' : 'border border-mist-200 bg-white text-slate-500'}`}
          >
            {s}
          </button>
        ))}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label="Sortierung"
          className="ml-auto h-9 rounded-lg border border-mist-200 bg-white px-2.5 text-[12px] font-bold text-deep-900 outline-none"
        >
          <option value="datum">Neueste zuerst</option>
          <option value="summe">Summe (höchste)</option>
        </select>
        <Button variant="ghost" onClick={exportCSV}>
          <Download className="h-4 w-4" aria-hidden /> CSV
        </Button>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-mist-200 bg-mist-50 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Bestellung</th>
                <th className="px-3 py-3">Kundin</th>
                <th className="px-3 py-3">Datum</th>
                <th className="px-3 py-3">Artikel</th>
                <th className="px-3 py-3">Summe</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-100">
              {pageItems.map((o) => (
                <tr key={o.id} className="hover:bg-mist-50">
                  <td className="px-5 py-3 text-[13px] font-bold text-deep-900">{o.id}</td>
                  <td className="px-3 py-3 text-[12.5px] text-slate-600">{o.customer}</td>
                  <td className="px-3 py-3 text-[12.5px] tabular-nums text-slate-500">
                    {new Date(o.dateISO + 'T12:00').toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="px-3 py-3 text-[12.5px] tabular-nums text-slate-500">{o.items.reduce((n, it) => n + it.qty, 0)}</td>
                  <td className="px-3 py-3 text-[13px] font-extrabold tabular-nums text-deep-950">{eur(o.total)}</td>
                  <td className="px-3 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => {
                        setOrderStatus(o.id, e.target.value as OrderStatus);
                        toast(`Status von ${o.id}: ${e.target.value}`);
                      }}
                      aria-label={`Status von ${o.id}`}
                      className={`h-9 rounded-lg border border-mist-200 px-2.5 text-[12px] font-bold outline-none ${statusColor[o.status]}`}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      onClick={() => setDetailId(o.id)}
                      aria-label={`Details von ${o.id}`}
                      className="tap inline-flex h-9 items-center gap-1.5 rounded-lg border border-mist-200 bg-white px-3 text-[12px] font-bold text-deep-900 hover:bg-mist-50"
                    >
                      <Eye className="h-4 w-4" aria-hidden /> Ansehen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyRow text="Keine Bestellungen für diese Filter." />}
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-mist-200 bg-mist-50 px-5 py-3">
            <p className="text-[12px] font-medium text-slate-400">
              {filtered.length} Bestellungen · Seite {safePage + 1} von {pages}
            </p>
            <div className="flex gap-1.5">
              <Button size="sm" variant="ghost" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
                Zurück
              </Button>
              <Button size="sm" variant="ghost" disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)}>
                Weiter
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal open={detailId !== null} onClose={() => setDetailId(null)} title={`Bestellung ${detail?.id ?? ''}`}>
        {detail && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-slate-500">{detail.customer}</p>
              <Badge className={statusColor[detail.status]}>{detail.status}</Badge>
            </div>
            <div className="space-y-2.5">
              {detail.items.map((it, i) => {
                const p = productByIdSafe(it.productId);
                return (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-mist-50 px-3.5 py-2.5">
                    {p && <img src={p.images[0]} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-lg object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-deep-900">{p?.shortTitle ?? it.productId}</p>
                      <p className="text-[11px] text-slate-400">
                        {it.qty}× {it.variantName || p?.vendor}
                      </p>
                    </div>
                    <span className="text-[13px] font-bold tabular-nums text-deep-950">{eur(it.price * it.qty)}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex justify-between border-t border-mist-200 pt-3">
              <span className="text-[14px] font-bold text-deep-950">Gesamt</span>
              <span className="text-[16px] font-extrabold tabular-nums text-deep-950">{eur(detail.total)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => toast('Demo: Rechnung würde als PDF geladen', 'info')}
                className="tap flex items-center gap-1.5 rounded-full border border-mist-200 bg-white px-3.5 py-2 text-[12px] font-bold text-deep-900"
              >
                <ReceiptText className="h-4 w-4 text-royal-600" aria-hidden /> Rechnung als PDF (Demo)
              </button>
              <Button variant="ghost" onClick={() => setDetailId(null)}>
                Schließen
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
