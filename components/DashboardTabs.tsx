export type DashboardTab = 'live' | 'players';

export default function DashboardTabs({ active, onChange }: { active: DashboardTab; onChange: (tab: DashboardTab) => void }) {
  const base = 'rounded-xl px-4 py-2 text-sm font-medium transition';
  return (
    <div className="mb-5 inline-flex rounded-2xl border border-slate-700 bg-slate-900 p-1">
      <button className={`${base} ${active === 'live' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:text-white'}`} onClick={() => onChange('live')}>
        Live Games
      </button>
      <button className={`${base} ${active === 'players' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:text-white'}`} onClick={() => onChange('players')}>
        Best Performing Players
      </button>
export type DashboardTab = 'games' | 'odds' | 'players' | 'roster' | 'tracker';

const TABS: { id: DashboardTab; label: string }[] = [
  { id: 'games',   label: 'Live Games' },
  { id: 'odds',    label: 'Betting Odds' },
  { id: 'players', label: 'Player Props' },
  { id: 'roster',  label: 'Roster & Averages' },
  { id: 'tracker', label: 'Bet Tracker' },
];

export default function DashboardTabs({ active, onChange }: { active: DashboardTab; onChange: (tab: DashboardTab) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-800 bg-slate-950 p-1">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
            active === t.id
              ? 'bg-orange-500 text-black shadow'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
