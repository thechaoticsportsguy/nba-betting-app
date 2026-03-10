import { PlayerAnalysis } from '@/lib/types';

export interface AnalysisFilterState {
  team: string;
  statType: string;
  confidence: string;
  game: string;
  sortBy: 'edge' | 'projected' | 'safest' | 'boom';
  search: string;
}

export default function PlayerAnalysisFilters({
  filters,
  onChange,
  players
}: {
  filters: AnalysisFilterState;
  onChange: (next: AnalysisFilterState) => void;
  players: PlayerAnalysis[];
}) {
  const teams = Array.from(new Set(players.map((p) => p.team).filter(Boolean))).sort();
  const games = Array.from(new Set(players.map((p) => p.game).filter(Boolean))).sort();

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <input
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          placeholder="Search player"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
        <select className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" value={filters.team} onChange={(e) => onChange({ ...filters, team: e.target.value })}>
          <option value="">All teams</option>
          {teams.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" value={filters.statType} onChange={(e) => onChange({ ...filters, statType: e.target.value })}>
          <option value="">All stats</option>
          <option value="points">Points</option>
          <option value="rebounds">Rebounds</option>
          <option value="assists">Assists</option>
          <option value="threes">Threes</option>
        </select>
        <select className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" value={filters.confidence} onChange={(e) => onChange({ ...filters, confidence: e.target.value })}>
          <option value="">All confidence</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" value={filters.game} onChange={(e) => onChange({ ...filters, game: e.target.value })}>
          <option value="">All games</option>
          {games.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" value={filters.sortBy} onChange={(e) => onChange({ ...filters, sortBy: e.target.value as AnalysisFilterState['sortBy'] })}>
          <option value="edge">Highest edge</option>
          <option value="projected">Highest projected output</option>
          <option value="safest">Safest</option>
          <option value="boom">Boom upside</option>
        </select>
      </div>
    </section>
  );
}
