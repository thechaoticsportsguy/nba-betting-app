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
    </div>
  );
}
