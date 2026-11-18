import { useMemo, useState } from 'react';
import { ChevronDown, Users, ExternalLink, Minus, Plus, Copy, GraduationCap, Euro } from 'lucide-react';
import { useAdmin, eur } from '../store/AdminStore';
import { Card, PageHeader, Badge, Toggle, Stat } from '../components/ui';

const levelColors: Record<string, string> = {
  Einsteiger: 'bg-emerald-50 text-emerald-700',
  Fortgeschritten: 'bg-royal-50 text-royal-700',
  Profi: 'bg-deep-900 text-white',
};

export default function Courses() {
  const { courses, updateCourse, adjustCourseEnrollments, duplicateCourse, toast } = useAdmin();
  const [filter, setFilter] = useState<'alle' | 'veröffentlicht' | 'entwurf'>('alle');
  const [sort, setSort] = useState<'standard' | 'preis' | 'einschreibungen'>('standard');
  const [expanded, setExpanded] = useState<string | null>(null);

  const totalRevenuePot = courses.filter((c) => c.published).reduce((n, c) => n + c.price * c.enrollments, 0);
  const publishedCount = courses.filter((c) => c.published).length;
  const lessonTotal = courses.reduce((n, c) => n + c.modules.reduce((m, mod) => m + mod.lessons.length, 0), 0);

  const shown = useMemo(() => {
    let list = courses;
    if (filter !== 'alle') list = list.filter((c) => (filter === 'veröffentlicht' ? c.published : !c.published));
    if (sort === 'preis') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'einschreibungen') list = [...list].sort((a, b) => b.enrollments - a.enrollments);
    return list;
  }, [courses, filter, sort]);

  return (
    <div className="anim-fade-up">
      <PageHeader title="Academy-Kurse" sub="Veröffentlichen, Preise und Einschreibungen verwalten" />

      {/* R1: Statistik */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<GraduationCap className="h-5 w-5" aria-hidden />} label="Kurse" value={courses.length.toString()} hint={`${publishedCount} veröffentlicht`} />
        <Stat icon={<Users className="h-5 w-5" aria-hidden />} label="Einschreibungen" value={enrollmentsSum(courses).toLocaleString('de-DE')} tone="emerald" />
        <Stat icon={<Euro className="h-5 w-5" aria-hidden />} label="Umsatzpotenzial" value={eur(totalRevenuePot)} hint="Preis × Einschreibungen" tone="gold" />
        <Stat icon={<GraduationCap className="h-5 w-5" aria-hidden />} label="Lektionen gesamt" value={lessonTotal.toString()} />
      </div>

      {/* R3: Filter + Sort */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        {(['alle', 'veröffentlicht', 'entwurf'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`tap rounded-full px-3.5 py-1.5 text-[12.5px] font-bold capitalize ${filter === f ? 'bg-deep-900 text-white' : 'border border-mist-200 bg-white text-slate-500'}`}
          >
            {f}
          </button>
        ))}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label="Kurs-Sortierung"
          className="ml-auto h-9 rounded-lg border border-mist-200 bg-white px-2.5 text-[12px] font-bold text-deep-900 outline-none"
        >
          <option value="standard">Standard-Reihenfolge</option>
          <option value="preis">Preis (höchste)</option>
          <option value="einschreibungen">Einschreibungen</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {shown.map((c) => {
          const lessonCount = c.modules.reduce((m, mod) => m + mod.lessons.length, 0);
          return (
            <Card key={c.id} className={`overflow-hidden ${c.published ? '' : 'opacity-60'}`}>
              <div className="flex gap-4 p-4">
                <img src={c.image} alt={c.title} className="h-[92px] w-[140px] shrink-0 rounded-xl object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* R8: Level-Farbcodierung */}
                    <Badge className={levelColors[c.level] ?? 'bg-royal-50 text-royal-700'}>{c.level}</Badge>
                    {c.real ? <Badge className="bg-emerald-50 text-emerald-700">Echt (Shop)</Badge> : <Badge className="bg-mist-100 text-slate-500">Demo-Kurs</Badge>}
                    {/* R9: Lektionsanzahl */}
                    <span className="text-[11px] font-semibold text-slate-400">{c.modules.length} Module · {lessonCount} Lektionen</span>
                  </div>
                  <h2 className="mt-1.5 line-clamp-1 text-[15px] font-bold text-deep-900">{c.title}</h2>
                  <p className="mt-0.5 flex items-center gap-2 text-[11.5px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" aria-hidden />
                      {/* R10: Einschreibungen ± Override */}
                      <button
                        onClick={() => adjustCourseEnrollments(c.id, -10)}
                        aria-label="Einschreibungen −10"
                        className="tap flex h-5 w-5 items-center justify-center rounded border border-mist-200 bg-white"
                      >
                        <Minus className="h-3 w-3" aria-hidden />
                      </button>
                      <span className="font-bold tabular-nums text-deep-900">{c.enrollments.toLocaleString('de-DE')}</span>
                      <button
                        onClick={() => adjustCourseEnrollments(c.id, 10)}
                        aria-label="Einschreibungen +10"
                        className="tap flex h-5 w-5 items-center justify-center rounded border border-mist-200 bg-white"
                      >
                        <Plus className="h-3 w-3" aria-hidden />
                      </button>
                    </span>
                  </p>
                </div>
              </div>

              {/* R4: Module expandierbar */}
              <button
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                className="tap flex w-full items-center justify-between border-t border-mist-100 bg-white px-4 py-2 text-left text-[12px] font-bold text-royal-700"
                aria-expanded={expanded === c.id}
              >
                Kursinhalte anzeigen ({c.modules.map((m) => m.lessons.length).join(' / ')} Lektionen)
                <ChevronDown className={`h-4 w-4 transition-transform ${expanded === c.id ? 'rotate-180' : ''}`} aria-hidden />
              </button>
              {expanded === c.id && (
                <div className="anim-fade-in border-t border-mist-100 px-4 py-3">
                  {c.modules.map((m, mi) => (
                    <div key={m.id} className="mb-2 last:mb-0">
                      <p className="text-[12px] font-bold text-deep-900">{mi + 1}. {m.title}</p>
                      <ul className="ml-3 mt-1 space-y-0.5">
                        {m.lessons.map((l) => (
                          <li key={l.id} className="text-[11.5px] text-slate-500">
                            {l.title} <span className="text-slate-300">· {l.duration} · {l.type}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 border-t border-mist-100 bg-mist-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11.5px] font-semibold text-slate-400">Preis</span>
                  <input
                    value={c.price.toString().replace('.', ',')}
                    onChange={(e) => {
                      const n = parseFloat(e.target.value.replace(',', '.').replace(/[^\d.]/g, ''));
                      if (!Number.isNaN(n) && n >= 0) updateCourse(c.id, { price: Math.round(n * 100) / 100 });
                    }}
                    aria-label={`Preis von ${c.title}`}
                    className="h-9 w-[80px] rounded-lg border border-mist-200 bg-white px-2.5 text-[12.5px] font-bold tabular-nums text-deep-950 outline-none focus:border-royal-500"
                  />
                  <span className="text-[12.5px] font-bold text-deep-950">{eur(c.price)}</span>
                  {/* R5: Preis-Presets */}
                  <button
                    onClick={() => { updateCourse(c.id, { price: Math.round(c.price * 0.8 * 100) / 100 }); toast('Preis −20 % gesetzt'); }}
                    aria-label={`Preis von ${c.title} um 20 % senken`}
                    className="tap rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600"
                  >
                    −20 %
                  </button>
                  <button
                    onClick={() => { updateCourse(c.id, { price: Math.round(c.price * 1.25 * 100) / 100 }); toast('Preis +25 % gesetzt'); }}
                    aria-label={`Preis von ${c.title} um 25 % erhöhen`}
                    className="tap rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700"
                  >
                    +25 %
                  </button>
                </div>
                <div className="ml-auto flex items-center gap-3.5">
                  {/* R7: Client-Preview */}
                  <a
                    href={`https://glamloox-app.vercel.app/#/academy/course/${c.id}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${c.title} in der Client-App ansehen`}
                    className="tap flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-mist-100 hover:text-royal-600"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                  {/* R6: Duplizieren */}
                  <button
                    onClick={() => { duplicateCourse(c.id); toast('Kurs dupliziert (Entwurf)', 'info'); }}
                    aria-label={`${c.title} duplizieren`}
                    className="tap flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-mist-100 hover:text-deep-900"
                  >
                    <Copy className="h-4 w-4" aria-hidden />
                  </button>
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
                      {c.published ? 'Veröffentlicht' : 'Entwurf'}
                    </span>
                    <Toggle on={c.published} onChange={(v) => updateCourse(c.id, { published: v })} label={`${c.title} veröffentlicht`} />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function enrollmentsSum(list: { enrollments: number }[]): number {
  return list.reduce((n, c) => n + c.enrollments, 0);
}
