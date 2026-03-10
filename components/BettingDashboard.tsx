'use client';

import { useEffect, useMemo, useState } from 'react';
import { toAmericanOdds, toDecimalOdds } from '@/lib/server/time';
import DashboardTabs, { DashboardTab } from '@/components/DashboardTabs';
import PlayerAnalysisFilters, { AnalysisFilterState } from '@/components/PlayerAnalysisFilters';
import PlayerAnalysisTable from '@/components/PlayerAnalysisTable';
import { PlayerAnalysis, PlayerAnalysisResponse } from '@/lib/types';

const defaultFilters: AnalysisFilterState = {
  team: '',
  statType: '',
  confidence: '',
  game: '',
  sortBy: 'edge',
  search: ''
};

export default function BettingDashboard({ odds, propsData }: { odds: any[]; propsData: any }) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('live');
  const [bookmaker, setBookmaker] = useState('all');
  const [format, setFormat] = useState<'american' | 'decimal'>('american');

  const [analysisData, setAnalysisData] = useState<PlayerAnalysisResponse | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalysisFilterState>(defaultFilters);

  useEffect(() => {
    if (activeTab !== 'players') return;
    if (analysisData) return;
    setAnalysisLoading(true);
    setAnalysisError(null);
    fetch('/api/player-analysis')
      .then((r) => r.json())
      .then((data) => {
        setAnalysisData(data);
        setAnalysisLoading(false);
      })
      .catch(() => {
        setAnalysisError('Failed to load player analysis. Check your ODDS_API_KEY.');
        setAnalysisLoading(false);
      });
  }, [activeTab, analysisData]);

  const filteredPlayers = useMemo((): PlayerAnalysis[] => {
    if (!analysisData?.players) return [];
    let list = [...analysisData.players];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((p) => p.playerName.toLowerCase().includes(q));
    }
    if (filters.team) list = list.filter((p) => p.team === filters.team);
    if (filters.statType) list = list.filter((p) => p.marketType === filters.statType);
    if (filters.confidence) list = list.filter((p) => p.confidence === filters.confidence);
    if (filters.game) list = list.filter((p) => p.game === filters.game);
    if (filters.sortBy === 'edge') list.sort((a, b) => b.edge - a.edge);
    else if (filters.sortBy === 'projected') list.sort((a, b) => b.projectedValue - a.projectedValue);
    else if (filters.sortBy === 'safest') list.sort((a, b) => (b.confidence === 'High' ? 1 : 0) - (a.confidence === 'High' ? 1 : 0));
    else if (filters.sortBy === 'boom') list.sort((a, b) => b.boomScore - a.boomScore);
    return list;
  }, [analysisData, filters]);

  const rows = useMemo(() => (odds ?? []).flatMap((game) =>
    (game.bookmakers ?? []).filter((b: any) => bookmaker === 'all' || b.key === bookmaker).flatMap((book: any) =>
      Object.entries(book.markets ?? {}).flatMap(([marketKey, outcomes]) =>
        (Array.isArray(outcomes) ? outcomes : []).map((outcome: any) => ({ game, book, marketKey, outcome }))
      )
    )
  ), [odds, bookmaker]);

  return (
    <div className="space-y-4">
      <DashboardTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === 'live' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <select className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100" value={bookmaker} onChange={(e) => setBookmaker(e.target.value)}>
              <option value="all">All books</option>
              {[...new Set((odds ?? []).flatMap((g) => (g.bookmakers ?? []).map((b: any) => b.key as string)))].filter(Boolean).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <button
              className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800"
              onClick={() => setFormat(format === 'american' ? 'decimal' : 'american')}
            >
              Odds: {format}
            </button>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center text-slate-400">
              No live odds available right now. Make sure <code className="rounded bg-slate-800 px-1 text-slate-300">ODDS_API_KEY</code> is set in Vercel environment variables.
            </div>
          ) : (
            <div className="overflow-auto rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
              <table className="w-full text-sm text-slate-100">
                <thead className="bg-slate-950 text-left text-slate-300">
                  <tr>
                    <th className="p-3">Game</th>
                    <th className="p-3">Book</th>
                    <th className="p-3">Market</th>
                    <th className="p-3">Outcome</th>
                    <th className="p-3">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 250).map((row: any, idx: number) => (
                    <tr key={idx} className="border-t border-slate-800">
                      <td className="p-3">{row.game.awayTeam} @ {row.game.homeTeam}</td>
                      <td className="p-3">{row.book.title}</td>
                      <td className="p-3">{row.marketKey}</td>
                      <td className="p-3">{row.outcome.name}</td>
                      <td className="p-3 font-medium">{format === 'american' ? toAmericanOdds(row.outcome.price) : toDecimalOdds(row.outcome.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'players' && (
        <div className="space-y-4">
          {analysisLoading && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center text-slate-400">
              Loading player analysis...
            </div>
          )}
          {analysisError && (
            <div className="rounded-xl border border-rose-800 bg-rose-950 p-4 text-rose-300">
              {analysisError}
            </div>
          )}
          {analysisData && !analysisLoading && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Source: <span className="text-slate-300">{analysisData.source}</span> &middot; {filteredPlayers.length} players shown &middot; Updated {new Date(analysisData.generatedAt).toLocaleTimeString()}
                </p>
                <button
                  className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
                  onClick={() => setAnalysisData(null)}
                >
                  Refresh
                </button>
              </div>
              <PlayerAnalysisFilters filters={filters} onChange={setFilters} players={analysisData.players} />
              <PlayerAnalysisTable players={filteredPlayers} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
