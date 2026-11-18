import { Eye, EyeOff, GraduationCap, Users } from 'lucide-react';
import { useAdmin, eur } from '../store/AdminStore';
import { Card, PageHeader, Badge, Toggle } from '../components/ui';

export default function Courses() {
  const { courses, updateCourse } = useAdmin();

  return (
    <div className="anim-fade-up">
      <PageHeader title="Academy-Kurse" sub="Veröffentlichen, Preise und Einschreibungen verwalten" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {courses.map((c) => (
          <Card key={c.id} className={`overflow-hidden ${c.published ? '' : 'opacity-60'}`}>
            <div className="flex gap-4 p-4">
              <img src={c.image} alt={c.title} className="h-[92px] w-[140px] shrink-0 rounded-xl object-cover" loading="lazy" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-royal-50 text-royal-700">{c.level}</Badge>
                  {c.real ? <Badge className="bg-emerald-50 text-emerald-700">Echt (Shop)</Badge> : <Badge className="bg-mist-100 text-slate-500">Demo-Kurs</Badge>}
                </div>
                <h2 className="mt-1.5 line-clamp-1 text-[15px] font-bold text-deep-900">{c.title}</h2>
                <p className="mt-0.5 flex items-center gap-3 text-[11.5px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" aria-hidden /> {c.enrollments.toLocaleString('de-DE')} Einschreibungen
                  </span>
                  <span>{c.hours} Std. · {c.modules.length} Module</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-mist-100 bg-mist-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] font-semibold text-slate-400">Preis</span>
                <input
                  value={c.price.toString().replace('.', ',')}
                  onChange={(e) => {
                    const n = parseFloat(e.target.value.replace(',', '.').replace(/[^\d.]/g, ''));
                    if (!Number.isNaN(n) && n >= 0) updateCourse(c.id, { price: Math.round(n * 100) / 100 });
                  }}
                  aria-label={`Preis von ${c.title}`}
                  className="h-9 w-[90px] rounded-lg border border-mist-200 bg-white px-2.5 text-[12.5px] font-bold tabular-nums text-deep-950 outline-none focus:border-royal-500"
                />
                <span className="text-[12.5px] font-bold text-deep-950">{eur(c.price)}</span>
              </div>
              <div className="ml-auto flex items-center gap-2.5">
                <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
                  {c.published ? <Eye className="h-4 w-4 text-royal-600" aria-hidden /> : <EyeOff className="h-4 w-4 text-slate-400" aria-hidden />}
                  {c.published ? 'Veröffentlicht' : 'Entwurf'}
                </span>
                <Toggle on={c.published} onChange={(v) => updateCourse(c.id, { published: v })} label={`${c.title} veröffentlicht`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-5 flex items-center gap-2 rounded-2xl bg-white p-3.5 text-[11px] leading-relaxed text-slate-400 shadow-card">
        <GraduationCap className="h-4 w-4 shrink-0 text-royal-400" aria-hidden />
        Kursnamen & Preise der „echten“ Kurse entsprechen dem Angebot von glamloox.net. Veröffentlichungs-Status und
        Einschreibungen sind Demo-Werte der Admin-Konsole.
      </p>
    </div>
  );
}
