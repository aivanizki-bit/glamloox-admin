import { Minus, Plus, Star, Award, Truck, BadgeCheck, Percent } from 'lucide-react';
import { useAdmin } from '../store/AdminStore';
import { Card, PageHeader, Badge } from '../components/ui';

const levels = [
  { name: 'Gold', min: 300, icon: Star, perks: ['5 % Dauerbonus auf GLAMLOOX®-Eigenprodukte'] },
  { name: 'Platin', min: 500, icon: Award, perks: ['Gratis-Versand ab 50 €', 'Early Access für Neuheiten'] },
  { name: 'Diamant', min: 600, icon: BadgeCheck, perks: ['Verifiziertes Profi-Badge in der Community'] },
  { name: 'Exklusiv', min: 1000, icon: Truck, perks: ['Kostenlose Express-Lieferung', 'Persönliche Ansprechpartnerin'] },
];

export default function RewardsPage() {
  const { rewardPoints, setRewardPoints, toast } = useAdmin();

  return (
    <div className="anim-fade-up">
      <PageHeader title="Rewards & Vorteile" sub="Punkte-Verwaltung und Level-Konfiguration (Demo-Konto der Kundin)" />

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
          <button
            onClick={() => { setRewardPoints(rewardPoints + 100); toast('+100 Punkte gutgeschrieben'); }}
            className="tap rounded-full bg-royal-600 px-4 py-2 text-[12.5px] font-bold text-white shadow-card"
          >
            +100 Bonus
          </button>
        </div>
      </Card>

      {/* Level-Konfiguration */}
      <h2 className="mb-3 text-[16px] font-bold tracking-tight text-deep-900">Level & Vorteile</h2>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        {levels.map((l) => {
          const unlocked = rewardPoints >= l.min;
          const Icon = l.icon;
          return (
            <Card key={l.name} className={`p-4.5 p-4 ${unlocked ? 'border-royal-100' : 'opacity-70'}`}>
              <div className="flex items-center gap-3.5">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${unlocked ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-white' : 'bg-mist-100 text-slate-400'}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-extrabold text-deep-950">{l.name}</p>
                    <Badge className={unlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-mist-100 text-slate-400'}>
                      ab {l.min} P.
                    </Badge>
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

      <p className="mt-5 rounded-2xl bg-white p-3.5 text-[11px] leading-relaxed text-slate-400 shadow-card">
        Demo-Konfiguration: Die Level-Schwellen sind Vorschläge für den echten Ausbau. Punkte-Änderungen aus der
        Admin-Konsole betreffen das Demo-Konto im Prototyp.
      </p>
    </div>
  );
}
