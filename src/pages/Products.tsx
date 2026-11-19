import { useMemo, useState } from 'react';
import { Search, Plus, Trash2, Eye, EyeOff, Copy, Download, Minus } from 'lucide-react';
import { useAdmin, eur } from '../store/AdminStore';
import { Card, PageHeader, Button, TextInput, Toggle, Modal, EmptyRow } from '../components/ui';

const catLabels: Record<string, string> = {
  'lash-lifting': 'Lash Lifting',
  brow: 'Brow & Farbe',
  pflege: 'Pflege',
  zubehoer: 'Zubehör',
};
const catEmoji: Record<string, string> = {
  'lash-lifting': '👁️',
  brow: '🖌️',
  pflege: '💧',
  zubehoer: '🧰',
};
const PER_PAGE = 10;

export default function Products() {
  const { products, updateProduct, addProduct, deleteProduct, duplicateProductSafe, toast } = useAdmin();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('alle');
  const [status, setStatus] = useState<'alle' | 'aktiv' | 'inaktiv'>('alle');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sort, setSort] = useState<'name' | 'preis-auf' | 'preis-ab' | 'bestand'>('name');
  const [page, setPage] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ shortTitle: '', vendor: 'GLAMLOOX®', price: '29,90', category: 'pflege', stock: '25' });

  const filtered = useMemo(() => {
    let list = products;
    if (cat !== 'alle') list = list.filter((p) => p.category === cat);
    if (status !== 'alle') list = list.filter((p) => (status === 'aktiv' ? p.active : !p.active));
    if (lowStockOnly) list = list.filter((p) => p.stock < 15);
    if (q.trim()) {
      const query = q.trim().toLowerCase();
      list = list.filter((p) => p.shortTitle.toLowerCase().includes(query) || p.vendor.toLowerCase().includes(query));
    }
    if (sort === 'name') list = [...list].sort((a, b) => a.shortTitle.localeCompare(b.shortTitle));
    if (sort === 'preis-auf') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'preis-ab') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'bestand') list = [...list].sort((a, b) => a.stock - b.stock);
    return list;
  }, [products, cat, status, q, lowStockOnly, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const pageItems = filtered.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);
  const inventoryValue = products.filter((p) => p.active).reduce((n, p) => n + p.price * p.stock, 0);

  const exportCSV = () => {
    const rows = [['ID', 'Name', 'Marke', 'Kategorie', 'Preis', 'Bestand', 'Badge', 'Aktiv'].join(';')];
    filtered.forEach((p) => rows.push([p.id, p.shortTitle, p.vendor, p.category, p.price.toString().replace('.', ','), p.stock, p.badge ?? '', p.active ? 'ja' : 'nein'].join(';')));
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'glamloox-produkte.csv';
    a.click();
    toast('CSV exportiert (' + filtered.length + ' Produkte)');
  };

  return (
    <div className="anim-fade-up">
      <PageHeader
        title="Produkte"
        sub={`${products.length} Produkte · ${products.filter((p) => p.active).length} aktiv · Inventarwert ${eur(inventoryValue)}`}
        action={
          <div className="flex gap-2.5">
            <Button variant="ghost" onClick={exportCSV}>
              <Download className="h-4 w-4" aria-hidden /> CSV
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden /> Produkt anlegen
            </Button>
          </div>
        }
      />

      {/* Filterleiste */}
      <Card className="mb-4 flex flex-wrap items-center gap-x-2.5 gap-y-2 p-3.5">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-mist-200 bg-mist-50 px-3">
          <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Produkt oder Marke suchen…"
            aria-label="Produkte durchsuchen"
            className="h-10 w-full bg-transparent text-[13px] font-medium outline-none placeholder:text-slate-400"
          />
        </div>
        {[['alle', 'Alle'], ['lash-lifting', 'Lash Lifting'], ['brow', 'Brow'], ['pflege', 'Pflege'], ['zubehoer', 'Zubehör']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setCat(id)}
            className={`tap rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${cat === id ? 'bg-deep-900 text-white' : 'border border-mist-200 bg-white text-slate-500'}`}
          >
            {label}
          </button>
        ))}
        <span className="mx-1 hidden h-6 w-px bg-mist-200 sm:block" aria-hidden />
        <button
          onClick={() => setLowStockOnly((v) => !v)}
          className={`tap rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${lowStockOnly ? 'bg-amber-500 text-white' : 'border border-amber-200 bg-amber-50 text-amber-700'}`}
        >
          ⚠ Bestand &lt; 15
        </button>
        {(['alle', 'aktiv', 'inaktiv'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`tap rounded-full px-3.5 py-1.5 text-[12.5px] font-bold capitalize ${status === s ? 'bg-royal-600 text-white' : 'border border-mist-200 bg-white text-slate-500'}`}
          >
            {s}
          </button>
        ))}
        <span className="mx-1 hidden h-6 w-px bg-mist-200 sm:block" aria-hidden />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label="Sortierung"
          className="h-9 rounded-lg border border-mist-200 bg-white px-2.5 text-[12px] font-bold text-deep-900 outline-none"
        >
          <option value="name">Sortierung: Name</option>
          <option value="preis-auf">Preis aufsteigend</option>
          <option value="preis-ab">Preis absteigend</option>
          <option value="bestand">Bestand (niedrigste)</option>
        </select>
        {/* Massen-Aktionen */}
        <span className="mx-1 hidden h-6 w-px bg-mist-200 sm:block" aria-hidden />
        <button
          onClick={() => { products.forEach((p) => updateProduct(p.id, { active: true })); toast('Alle Produkte aktiviert'); }}
          className="tap rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-[12px] font-bold text-emerald-700"
        >
          Alle aktivieren
        </button>
        <button
          onClick={() => { products.forEach((p) => updateProduct(p.id, { active: false })); toast('Alle Produkte deaktiviert', 'info'); }}
          className="tap rounded-full border border-mist-200 bg-white px-3.5 py-1.5 text-[12px] font-bold text-slate-500"
        >
          Alle deaktivieren
        </button>
      </Card>

      {/* Tabelle */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-mist-200 bg-mist-50 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Produkt</th>
                <th className="px-3 py-3">Kategorie</th>
                <th className="px-3 py-3 text-right">Preis (€)</th>
                <th className="px-3 py-3">Badge</th>
                <th className="px-3 py-3 text-right">Bestand</th>
                <th className="px-3 py-3">Aktiv</th>
                <th className="px-3 py-3 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-100">
              {pageItems.map((p) => (
                <tr key={p.id} className={`hover:bg-mist-50 ${p.active ? '' : 'opacity-50'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-deep-900">{catEmoji[p.category]} {p.shortTitle}</p>
                        <p className="text-[11px] text-slate-400">{p.vendor}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[12.5px] text-slate-500">{catLabels[p.category] ?? p.category}</td>
                  <td className="px-3 py-3">
                    <TextInput
                      value={p.price.toString().replace('.', ',')}
                      onChange={(v) => {
                        const n = parseFloat(v.replace(',', '.').replace(/[^\d.]/g, ''));
                        if (!Number.isNaN(n) && n >= 0) updateProduct(p.id, { price: Math.round(n * 100) / 100 });
                      }}
                      ariaLabel={`Preis von ${p.shortTitle}`}
                      className="h-9 w-[90px] text-right tabular-nums"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={p.badge ?? ''}
                      onChange={(e) => updateProduct(p.id, { badge: e.target.value || null })}
                      aria-label={`Badge von ${p.shortTitle}`}
                      className="h-9 rounded-lg border border-mist-200 bg-white px-2 text-[12px] font-semibold text-deep-900 outline-none"
                    >
                      <option value="">– kein –</option>
                      <option value="Bestseller">Bestseller</option>
                      <option value="Neu">Neu</option>
                      <option value="Set-Vorteil">Set-Vorteil</option>
                      <option value="Profi-Set">Profi-Set</option>
                      <option value="Korean Style">Korean Style</option>
                    </select>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => updateProduct(p.id, { stock: Math.max(0, p.stock - 1) })}
                        aria-label={`Bestand von ${p.shortTitle} verringern`}
                        className="tap flex h-7 w-7 items-center justify-center rounded-md border border-mist-200 bg-white text-slate-500 hover:bg-mist-100"
                      >
                        <Minus className="h-3 w-3" aria-hidden />
                      </button>
                      <span className={`w-9 text-center text-[13px] font-bold tabular-nums ${p.stock < 15 ? 'text-amber-600' : 'text-deep-950'}`}>
                        {p.stock}
                      </span>
                      <button
                        onClick={() => updateProduct(p.id, { stock: p.stock + 1 })}
                        aria-label={`Bestand von ${p.shortTitle} erhöhen`}
                        className="tap flex h-7 w-7 items-center justify-center rounded-md border border-mist-200 bg-white text-slate-500 hover:bg-mist-100"
                      >
                        <Plus className="h-3 w-3" aria-hidden />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Toggle on={p.active} onChange={(v) => updateProduct(p.id, { active: v })} label={`${p.shortTitle} aktiv`} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => { duplicateProductSafe(p.id); toast('Produkt dupliziert', 'info'); }}
                        aria-label={`${p.shortTitle} duplizieren`}
                        className="tap flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-royal-50 hover:text-royal-600"
                      >
                        <Copy className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        onClick={() => updateProduct(p.id, { active: !p.active })}
                        aria-label={p.active ? `${p.shortTitle} deaktivieren` : `${p.shortTitle} aktivieren`}
                        className="tap flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-mist-100 hover:text-deep-900"
                      >
                        {p.active ? <Eye className="h-4 w-4" aria-hidden /> : <EyeOff className="h-4 w-4" aria-hidden />}
                      </button>
                      <button
                        onClick={() => setDelId(p.id)}
                        aria-label={`${p.shortTitle} löschen`}
                        className="tap flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyRow text="Keine Produkte für diese Filter gefunden." />}
        </div>
        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-mist-200 bg-mist-50 px-5 py-3">
            <p className="text-[12px] font-medium text-slate-400">
              {filtered.length} Produkte · Seite {safePage + 1} von {pages}
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

      {/* Anlegen-Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Neues Produkt anlegen">
        <div className="space-y-3">
          <TextInput value={draft.shortTitle} onChange={(v) => setDraft({ ...draft, shortTitle: v })} placeholder="Produktname" ariaLabel="Produktname" />
          <TextInput value={draft.vendor} onChange={(v) => setDraft({ ...draft, vendor: v })} placeholder="Marke" ariaLabel="Marke" />
          <div className="flex gap-3">
            <TextInput value={draft.price} onChange={(v) => setDraft({ ...draft, price: v })} placeholder="Preis" ariaLabel="Preis in Euro" className="flex-1" />
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              aria-label="Kategorie"
              className="h-10 flex-1 rounded-xl border border-mist-200 bg-white px-3 text-[13px] font-medium outline-none"
            >
              <option value="pflege">Pflege</option>
              <option value="lash-lifting">Lash Lifting</option>
              <option value="brow">Brow & Farbe</option>
              <option value="zubehoer">Zubehör</option>
            </select>
            <TextInput value={draft.stock} onChange={(v) => setDraft({ ...draft, stock: v })} placeholder="Bestand" ariaLabel="Bestand" className="w-[90px]" />
          </div>
          <div className="flex justify-end gap-2.5 pt-1">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                const price = parseFloat(draft.price.replace(',', '.'));
                const stock = parseInt(draft.stock, 10);
                if (!draft.shortTitle.trim() || Number.isNaN(price)) {
                  toast('Name und Preis sind Pflichtfelder', 'error');
                  return;
                }
                addProduct({ ...draft, price, stock: Number.isNaN(stock) ? 25 : stock });
                setAddOpen(false);
                setDraft({ shortTitle: '', vendor: 'GLAMLOOX®', price: '29,90', category: 'pflege', stock: '25' });
                toast('Produkt angelegt ✓');
              }}
            >
              Anlegen
            </Button>
          </div>
        </div>
      </Modal>

      {/* Löschen-Bestätigung */}
      <Modal open={delId !== null} onClose={() => setDelId(null)} title="Produkt löschen?">
        <p className="text-[13.5px] leading-relaxed text-slate-600">
          „{products.find((p) => p.id === delId)?.shortTitle}“ wird aus der Demo-Datenbank entfernt. Dies kann im Prototyp
          nicht rückgängig gemacht werden.
        </p>
        <div className="mt-4 flex justify-end gap-2.5">
          <Button variant="ghost" onClick={() => setDelId(null)}>
            Abbrechen
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (delId) deleteProduct(delId);
              setDelId(null);
              toast('Produkt gelöscht', 'info');
            }}
          >
            Endgültig löschen
          </Button>
        </div>
      </Modal>
    </div>
  );
}
