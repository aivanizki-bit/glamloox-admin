import { ShieldCheck, Trash2, MessageCircle, Heart } from 'lucide-react';
import { useAdmin, type AdminPost } from '../store/AdminStore';
import { Card, PageHeader, Badge, Toggle } from '../components/ui';

const typeLabels = { ergebnis: 'Ergebnis', frage: 'Frage', tipp: 'Tipp' };
const typeColors = { ergebnis: 'bg-royal-600', frage: 'bg-amber-500', tipp: 'bg-emerald-500' };

export default function CommunityPage() {
  const { posts, members, togglePostHidden, deletePost, toggleVerified, toast } = useAdmin();

  return (
    <div className="anim-fade-up">
      <PageHeader title="Community" sub={`${posts.length} Beiträge · ${members.length} Mitglieder · Moderation & Verifizierung`} />

      {/* Mitglieder */}
      <Card className="mb-5 overflow-hidden">
        <div className="border-b border-mist-200 bg-mist-50 px-5 py-3">
          <h2 className="flex items-center gap-2 text-[14px] font-bold text-deep-900">
            <ShieldCheck className="h-[18px] w-[18px] text-royal-600" aria-hidden /> Mitglieder verifizieren
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-mist-200 p-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white" style={{ background: m.gradient }}>
                {m.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-[13px] font-bold text-deep-900">
                  {m.name}
                  {m.verified && <ShieldCheck className="h-4 w-4 shrink-0 text-royal-600" aria-hidden />}
                </p>
                <p className="truncate text-[11px] text-slate-400">{m.role} · {m.city}</p>
              </div>
              <Toggle on={m.verified} onChange={() => { toggleVerified(m.id); toast(m.verified ? 'Verifizierung entzogen' : 'Mitglied verifiziert ✓'); }} label={`${m.name} verifizieren`} />
            </div>
          ))}
        </div>
      </Card>

      {/* Beiträge */}
      <h2 className="mb-3 text-[16px] font-bold tracking-tight text-deep-900">Beiträge moderieren</h2>
      <div className="space-y-3">
        {posts.map((p) => (
          <PostRow
            key={p.id}
            post={p}
            onHide={() => { togglePostHidden(p.id); toast(p.hidden ? 'Beitrag wieder sichtbar' : 'Beitrag versteckt', 'info'); }}
            onDelete={() => { deletePost(p.id); toast('Beitrag gelöscht', 'info'); }}
          />
        ))}
      </div>
    </div>
  );
}

function PostRow({ post, onHide, onDelete }: { post: AdminPost; onHide: () => void; onDelete: () => void }) {
  return (
    <Card className={`p-4 ${post.hidden ? 'opacity-50' : ''}`}>
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-[200px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`text-white ${typeColors[post.type]}`}>{typeLabels[post.type]}</Badge>
            <p className="text-[14px] font-bold text-deep-900">{post.title ?? post.text.slice(0, 48) + '…'}</p>
            {post.hidden && <Badge className="bg-mist-200 text-slate-500">Versteckt</Badge>}
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
