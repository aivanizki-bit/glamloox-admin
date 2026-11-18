import { useMemo, useState } from 'react';
import { ShieldCheck, Trash2, MessageCircle, Heart, Pin, Search, EyeOff } from 'lucide-react';
import { useAdmin, type AdminPost } from '../store/AdminStore';
import { Card, PageHeader, Badge, Toggle, Stat, EmptyRow } from '../components/ui';

const typeLabels = { ergebnis: 'Ergebnis', frage: 'Frage', tipp: 'Tipp' };
const typeColors = { ergebnis: 'bg-royal-600', frage: 'bg-amber-500', tipp: 'bg-emerald-500' };

export default function CommunityPage() {
  const { posts, members, togglePostHidden, togglePostPinned, deletePost, toggleVerified, toast } = useAdmin();
  const [tab, setTab] = useState<'beitraege' | 'mitglieder'>('beitraege');
  const [q, setQ] = useState('');
  const [type, setType] = useState<'alle' | AdminPost['type']>('alle');
  const [authorFilter, setAuthorFilter] = useState<string | null>(null);
  const [sortLikes, setSortLikes] = useState(false);

  const totalLikes = posts.reduce((n, p) => n + p.likes, 0);
  const totalComments = posts.reduce((n, p) => n + p.comments.length, 0);

  const shown = useMemo(() => {
    let list = posts;
    if (type !== 'alle') list = list.filter((p) => p.type === type);
    if (authorFilter) list = list.filter((p) => p.authorId === authorFilter);
    if (q.trim()) {
      const query = q.trim().toLowerCase();
      list = list.filter((p) => p.title?.toLowerCase().includes(query) || p.text.toLowerCase().includes(query));
    }
    list = [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned) || (sortLikes ? b.likes - a.likes : 0));
    return list;
  }, [posts, type, authorFilter, q, sortLikes]);

  return (
    <div className="anim-fade-up">
      <PageHeader title="Community" sub="Moderation, Verifizierung und Einblicke" />

      {/* R2: Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<MessageCircle className="h-5 w-5" aria-hidden />} label="Beiträge" value={posts.length.toString()} hint={`${posts.filter((p) => p.hidden).length} versteckt`} />
        <Stat icon={<Heart className="h-5 w-5" aria-hidden />} label="Likes gesamt" value={totalLikes.toString()} tone="emerald" />
        <Stat icon={<MessageCircle className="h-5 w-5" aria-hidden />} label="Kommentare" value={totalComments.toString()} />
        <Stat icon={<ShieldCheck className="h-5 w-5" aria-hidden />} label="Verifiziert" value={members.filter((m) => m.verified).length.toString()} hint={`von ${members.length}`} tone="gold" />
      </div>

      {/* R1: Tabs */}
      <div className="mb-4 flex gap-2.5">
        {(
          [
            ['beitraege', `Beiträge · ${posts.length}`],
            ['mitglieder', `Mitglieder · ${members.length}`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`tap rounded-full px-4 py-2 text-[13px] font-bold ${tab === id ? 'bg-deep-900 text-white shadow-card' : 'border border-mist-200 bg-white text-slate-500'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'mitglieder' ? (
        /* R10: Massen-Verifizierung */
        <div>
          <div className="mb-3 flex gap-2.5">
            <button
              onClick={() => { members.forEach((m) => { if (!m.verified) toggleVerified(m.id); }); toast('Alle Mitglieder verifiziert'); }}
              className="tap rounded-full border border-royal-200 bg-royal-50 px-4 py-2 text-[12.5px] font-bold text-royal-700"
            >
              Alle verifizieren
            </button>
            <button
              onClick={() => { members.forEach((m) => { if (m.verified) toggleVerified(m.id); }); toast('Alle Verifizierungen entzogen', 'info'); }}
              className="tap rounded-full border border-mist-200 bg-white px-4 py-2 text-[12.5px] font-bold text-slate-500"
            >
              Keine verifiziert
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-mist-200 bg-white p-3.5 shadow-card">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white" style={{ background: m.gradient }}>
                  {m.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-[13px] font-bold text-deep-900">
                    {m.name}
                    {m.verified && <ShieldCheck className="h-4 w-4 shrink-0 text-royal-600" aria-hidden />}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">{m.role} · {m.city}</p>
                  <button
                    onClick={() => { setTab('beitraege'); setAuthorFilter(m.id); }}
                    className="tap text-[11px] font-bold text-royal-700"
                  >
                    Beiträge ansehen →
                  </button>
                </div>
                <Toggle on={m.verified} onChange={() => { toggleVerified(m.id); toast(m.verified ? 'Verifizierung entzogen' : 'Mitglied verifiziert ✓'); }} label={`${m.name} verifizieren`} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* R3-R5: Suche, Typ-Filter, Top-Sort */}
          <Card className="mb-4 flex flex-wrap items-center gap-2.5 p-3.5">
            <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-mist-200 bg-mist-50 px-3">
              <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Beiträge durchsuchen…"
                aria-label="Beiträge durchsuchen"
                className="h-10 w-full bg-transparent text-[13px] font-medium outline-none placeholder:text-slate-400"
              />
            </div>
            {authorFilter && (
              <button
                onClick={() => setAuthorFilter(null)}
                className="tap rounded-full bg-royal-600 px-3.5 py-1.5 text-[12px] font-bold text-white"
              >
                Autor-Filter aktiv ✕
              </button>
            )}
            {(['alle', 'ergebnis', 'frage', 'tipp'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`tap rounded-full px-3.5 py-1.5 text-[12.5px] font-bold capitalize ${type === t ? 'bg-deep-900 text-white' : 'border border-mist-200 bg-white text-slate-500'}`}
              >
                {t === 'alle' ? 'Alle' : typeLabels[t]}
              </button>
            ))}
            <button
              onClick={() => setSortLikes((v) => !v)}
              className={`tap ml-auto rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${sortLikes ? 'bg-royal-600 text-white' : 'border border-mist-200 bg-white text-slate-500'}`}
            >
              <Heart className="mr-1 inline h-3 w-3" aria-hidden /> Nach Likes
            </button>
          </Card>

          <div className="space-y-3">
            {shown.map((p) => (
              <PostRow
                key={p.id}
                post={p}
                onHide={() => { togglePostHidden(p.id); toast(p.hidden ? 'Beitrag wieder sichtbar' : 'Beitrag versteckt', 'info'); }}
                onPin={() => { togglePostPinned(p.id); toast(p.pinned ? 'Hervorhebung entfernt' : 'Beitrag hervorgehoben 📌'); }}
                onDelete={() => { deletePost(p.id); toast('Beitrag gelöscht', 'info'); }}
              />
            ))}
            {shown.length === 0 && <Card><EmptyRow text="Keine Beiträge für diese Filter." /></Card>}
          </div>
        </>
      )}
    </div>
  );
}

function PostRow({ post, onHide, onPin, onDelete }: { post: AdminPost; onHide: () => void; onPin: () => void; onDelete: () => void }) {
  return (
    <Card className={`p-4 ${post.hidden ? 'opacity-50' : ''} ${post.pinned ? 'border-royal-300 bg-royal-50/40' : ''}`}>
      <div className="flex flex-wrap items-start gap-3">
        {/* R9: Bild-Preview */}
        {post.images.length > 0 && (
          <img src={post.images[0]} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
        )}
        <div className="min-w-[200px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`text-white ${typeColors[post.type]}`}>{typeLabels[post.type]}</Badge>
            <p className="text-[14px] font-bold text-deep-900">{post.title ?? post.text.slice(0, 48) + '…'}</p>
            {post.pinned && <Badge className="bg-royal-600 text-white"><Pin className="mr-1 h-3 w-3" aria-hidden /> Hervorgehoben</Badge>}
            {post.hidden && <Badge className="bg-mist-200 text-slate-500"><EyeOff className="mr-1 h-3 w-3" aria-hidden /> Versteckt</Badge>}
          </div>
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-slate-500">{post.text}</p>
          <p className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" aria-hidden /> {post.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden /> {post.comments.length} Kommentare
            </span>
            <span>{post.ago}</span>
          </p>
        </div>
        <div className="flex items-center gap-3.5">
          <button
            onClick={onPin}
            aria-label={post.pinned ? 'Hervorhebung entfernen' : 'Beitrag hervorheben'}
            className={`tap flex h-9 w-9 items-center justify-center rounded-lg ${post.pinned ? 'bg-royal-600 text-white' : 'text-slate-400 hover:bg-royal-50 hover:text-royal-600'}`}
          >
            <Pin className="h-4 w-4" aria-hidden />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] font-semibold text-slate-400">Sichtbar</span>
            <Toggle on={!post.hidden} onChange={onHide} label="Beitrag sichtbar" />
          </div>
          <button
            onClick={onDelete}
            aria-label="Beitrag löschen"
            className="tap flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </Card>
  );
}
