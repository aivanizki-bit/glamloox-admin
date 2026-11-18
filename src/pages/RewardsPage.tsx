import { Star, Award, BadgeCheck, Truck, Percent, Minus, Plus, History } from 'lucide-react';
import { useAdmin } from '../store/AdminStore';
import { Card, PageHeader, Badge, Button } from '../components/ui';

const levelIcons = [Star, Award, BadgeCheck, Truck];

export default function RewardsPage() {
  const { rewardPoints, setRewardPoints, levelConfig, updateLevel, punkteRegeln, setPunkteRegeln, toast } = useAdmin();

  return (
    <div className="anim-fade-up">
      <PageHeader title="Rewards & Vorteile" sub="Punkte-Verwaltung, Level-Schwellwerte und Regeln (Demo-Konto)" />

      {/* Punkte-Verwaltung */}
      <Card className="mb-5 overflow-hidden">
        <div className="border-b border-mist-200 bg-gradient-to-r from-deep-950 to-deep-900 px-5 py-5">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-gold-400">Demo-Konto · Lena Meier</p>
          <p className="mt-1 text-[26px] font-extrabold leading-tight text-white tabular-nums">{rewardPoints} Punkte</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <span className="text-[13px] font-semibold text-slate-500">Punkte anpassen (Admin-Aktion):</span>
          <div className="flex items-center gap-2.5 rounded-xl border border-mist-200 px-2 py-1.5">
            <button
              onClick={() => setRewardPoints(rewardPoints - 50)}
              aria-label="50 Punkte abziehen"
              className="tap flex h-8 w-8 items-center justify-center rounded-lg text-deep-900 hover:bg-mist-100"
            >
              <Minus className="h-4 w-4" aria-hidden />
            </button>
            <span className="w-16 text-center text-[15px] font-extrabold tabular-nums text-deep-950">{rewardPoints}</span>
            <button
              onClick={() => setRewardPoints(rewardPoints + 50)}
              aria-label="50 Punkte hinzufügen"
              className="tap flex h-8 w-8 items-center justify-center rounded-lg text-deep-900 hover:bg-mist-100"
            >
              <Plus className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <Button onClick={() => { setRewardPoints(rewardPoints + 100); toast('+100 Punkte gutgeschrieben'); }}>
            +100 Bonus
          </Button>
          <Button variant="ghost" onClick={() => { setRewardPoints(480); toast('Punkte zurückgesetzt (480)', 'info'); }}>
            Reset
          </Button>
        </div>
      </Card>

      {/* Level-Konfiguration mit Editor */}
      <h2 className="mb-3 text-[16px] font-bold tracking-tight text-deep-900">Level & Vorteile (editierbar)</h2>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        {levelConfig.map((l, i) => {
          const Icon = levelIcons[i];
          const unlocked = rewardPoints >= l.min;
          return (
            <Card key={l.name} className={`p-4 ${unlocked ? 'border-royal-100' : 'opacity-80'}`}>
              <div className="flex items-center gap-3.5">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${unlocked ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-white' : 'bg-mist-100 text-slate-400'}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-extrabold text-deep-950">{l.name}</p>
                    <Badge className={unlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-mist-100 text-slate-400'}>
                      ab{' '}
                      <input
                        value={l.min.toString()}
                        onChange={(e) => {
                          const v = parseInt(e.target.value.replace(/\D/g, ''), 10);
                          if (!Number.isNaN(v)) updateLevel(i, { min: v });
                        }}
                        aria-label={`Schwellwert für ${l.name}`}
                        className="w-12 rounded border border-mist-200 bg-white px-1 text-center text-[11px] font-bold outline-none"
                      />
                      P.
                    </Badge>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-mist-100">
                    <div className="h-full rounded-full bg-royal-500" style={{ width: Math.min(100, (rewardPoints / l.min) * 100) + '%' }} />
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {l.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-[12px] text-slate-500">
                        <Percent className="mt-0.5 h-3 w-3 shrink-0 text-royal-400" aria-hidden />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Punkte-Regeln */}
      <h2 className="mb-3 pt-6 text-[16px] font-bold tracking-tight text-deep-900">Punkte-Regeln</h2>
      <Card className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
        {(
          [
            ['euroProPunkt', '€ pro 1 Punkt'],
            ['bonusOrder', 'Bonus pro Bestellung'],
            ['bonusPost', 'Bonus pro Beitrag'],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="rounded-xl bg-mist-50 p-3">
            <p className="text-[11.5px] font-semibold text-slate-400">{label}</p>
            <input
              value={punkteRegeln[key].toString()}
              onChange={(e) => {
                const v = parseInt(e.target.value.replace(/\D/g, ''), 10);
                if (!Number.isNaN(v)) setPunkteRegeln({ [key]: v });
              }}
              aria-label={label}
              className="mt-1 w-20 rounded-lg border border-mist-200 bg-white px-2 py-1.5 text-[14px] font-bold tabular-nums text-deep-950 outline-none focus:border-royal-500"
            />
          </div>
        ))}
      </Card>

      {/* Punkte-Historie */}
      <h2 className="mb-3 flex items-center gap-2 pt-6 text-[16px] font-bold tracking-tight text-deep-900">
        <History className="h-[18px] w-[18px] text-royal-600" aria-hidden /> Punkte-Log (Demo-Konto)
      </h2>
      <Card className="p-4">
        {[
          ['Willkommensbonus', 150],
          ['Kurs abgeschlossen: REANIMATION DER WIMPERN™', 100],
          ['Community-Beitrag veröffentlicht', 25],
          ['Bestellbonus (letzte Demo-Bestellung)', 50],
        ].map(([label, delta]) => (
          <div key={label as string} className="flex items-center justify-between border-b border-mist-100 py-2.5 last:border-0">
            <p className="min-w-0 truncate pr-3 text-[12.5px] font-semibold text-deep-900">{label}</p>
            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11.5px] font-bold text-emerald-700">+{delta} P.</span>
          </div>
        ))}
        <p className="pt-2 text-[10.5px] text-slate-400">
          Aktuelle Regeln: {punkteRegeln.euroProPunkt} € = 1 P. · +{punkteRegeln.bonusOrder} P. pro Bestellung · +
          {punkteRegeln.bonusPost} P. pro Beitrag
        </p>
      </Card>
    </div>
  );
}
