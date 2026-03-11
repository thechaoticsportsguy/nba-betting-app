'use client';

import { useEffect, useMemo, useState } from 'react';
import { toAmericanOdds, toDecimalOdds } from '@/lib/server/time';
import DashboardTabs, { DashboardTab } from '@/components/DashboardTabs';
import PlayerAnalysisFilters, { AnalysisFilterState } from '@/components/PlayerAnalysisFilters';
import PlayerAnalysisTable from '@/components/PlayerAnalysisTable';
import { PlayerAnalysis, PlayerAnalysisResponse } from '@/lib/types';
import BetTracker from '@/components/BetTracker';

/* ─── types ─── */
type LiveGame = {
  id: string;
  shortStatus: string;
  status: string;
  startTimeET: string;
  period?: number;
  clock?: string;
  homeTeam: { name: string; abbreviation: string; logo: string; score: number };
  awayTeam: { name: string; abbreviation: string; logo: string; score: number };
};

type RosterPlayer = {
  id: string;
  name: string;
  points: number;
  rebounds: number;
  assists: number;
  team?: { name: string; abbreviation: string };
};

const defaultFilters: AnalysisFilterState = {
  team: '', statType: '', confidence: '', game: '', sortBy: 'edge', search: ''
};

/* ─── helpers ─── */
function statusBadge(g: LiveGame) {
  if (g.status === 'in') {
    const q = g.period ? `Q${g.period}` : 'LIVE';
    const clk = g.clock ?? '';
    return <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-400">{q}{clk ? ` ${clk}` : ' LIVE'}</span>;
  }
  if (g.status === 'post') return <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">Final</span>;
  return <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{g.startTimeET}</span>;
}

function ScoreCard({ game }: { game: LiveGame }) {
  const live = game.status === 'in';
  return (
    <div className={`rounded-xl border p-4 transition ${live ? 'border-red-900 bg-slate-950 shadow-red-900/30 shadow-md' : 'border-slate-800 bg-slate-950'}`}>
      <div className="mb-3 flex items-center justify-between">
        {statusBadge(game)}
        {game.status === 'pre' && <span className="text-xs text-slate-500">Upcoming</span>}
      </div>
      {/* Away */}
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-white">{game.awayTeam.abbreviation}</span>
        <span className={`text-2xl font-extrabold ${live && game.awayTeam.score > game.homeTeam.score ? 'text-white' : 'text-slate-400'}`}>
          {game.status === 'pre' ? '–' : game.awayTeam.score}
        </span>
      </div>
      <div className="my-1 border-t border-slate-800" />
      {/* Home */}
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-white">{game.homeTeam.abbreviation}</span>
        <span className={`text-2xl font-extrabold ${live && game.homeTeam.score > game.awayTeam.score ? 'text-white' : 'text-slate-400'}`}>
          {game.status === 'pre' ? '–' : game.homeTeam.score}
        </span>
      </div>
      <div className="mt-2 text-xs text-slate-600">{game.awayTeam.name} @ {game.homeTeam.name}</div>
    </div>
  );
}

/* ─── main component ─── */
export default function BettingDashboard({ odds, propsData }: { odds: any[]; propsData: any }) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('games');
  const [bookmaker, setBookmaker] = useState('all');
  const [format, setFormat] = useState<'american' | 'decimal'>('american');

  // Live games
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [gamesTs, setGamesTs] = useState(0);

  // Roster
  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterTeam, setRosterTeam] = useState('');

  // Player analysis
  const [analysisData, setAnalysisData] = useState<PlayerAnalysisResponse | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalysisFilterState>(defaultFilters);

  /* fetch live games whenever tab is 'games' */
  useEffect(() => {
    if (activeTab !== 'games') return;
    const now = Date.now();
    if (now - gamesTs < 15_000 && liveGames.length) return; // 15 s cache
    setGamesLoading(true);
    setGamesError(null);
    fetch('/api/live-games')
      .then((r) => r.json())
      .then((d) => { setLiveGames(d.games ?? []); setGamesTs(Date.now()); setGamesLoading(false); })
      .catch(() => { setGamesError('Could not load live games.'); setGamesLoading(false); });
  }, [activeTab, gamesTs, liveGames.length]);

  /* fetch roster once */
  useEffect(() => {
    if (activeTab !== 'roster') return;
    if (roster.length) return;
    setRosterLoading(true);
    fetch('/api/players')
      .then((r) => r.json())
      .then((d) => { setRoster(d.players ?? []); setRosterLoading(false); })
      .catch(() => setRosterLoading(false));
  }, [activeTab, roster.length]);

  /* fetch player analysis once */
  useEffect(() => {
    if (activeTab !== 'players') return;
    if (analysisData) return;
    setAnalysisLoading(true);
    setAnalysisError(null);
    fetch('/api/player-analysis')
      .then((r) => r.json())
      .then((data) => { setAnalysisData(data); setAnalysisLoading(false); })
      .catch(() => { setAnalysisError('Failed to load player analysis. Check ODDS_API_KEY.'); setAnalysisLoading(false); });
  }, [activeTab, analysisData]);

  const filteredPlayers = useMemo((): PlayerAnalysis[] => {
    if (!analysisData?.players) return [];
    let list = [...analysisData.players];
    if (filters.search) { const q = filters.search.toLowerCase(); list = list.filter((p) => p.playerName.toLowerCase().includes(q)); }
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

  const oddsRows = useMemo(() => (odds ?? []).flatMap((game) =>
    (game.bookmakers ?? []).filter((b: any) => bookmaker === 'all' || b.key === bookmaker).flatMap((book: any) =>
      Object.entries(book.markets ?? {}).flatMap(([marketKey, outcomes]) =>
        (Array.isArray(outcomes) ? outcomes : []).map((outcome: any) => ({ game, book, marketKey, outcome }))
      )
    )
  ), [odds, bookmaker]);

  const filteredRoster = useMemo(() => {
    let list = roster;
    if (rosterSearch) { const q = rosterSearch.toLowerCase(); list = list.filter((p) => p.name.toLowerCase().includes(q)); }
    if (rosterTeam) list = list.filter((p) => p.team?.abbreviation === rosterTeam || p.team?.name === rosterTeam);
    return list;
  }, [roster, rosterSearch, rosterTeam]);

  const rosterTeams = useMemo(() =>
    [...new Map(roster.filter((p) => p.team).map((p) => [p.team!.abbreviation, p.team!])).values()].sort((a, b) => a.abbreviation.localeCompare(b.abbreviation)),
    [roster]
  );

  /* ─── live games (today's schedule + scores) ─── */
  const live = liveGames.filter((g) => g.status === 'in');
  const upcoming = liveGames.filter((g) => g.status === 'pre' || g.status === 'scheduled');
  const finished = liveGames.filter((g) => g.status === 'post');

  return (
    <div className="space-y-5">
      <DashboardTabs active={activeTab} onChange={setActiveTab} />

      {/* ═══ LIVE GAMES ═══ */}
      {activeTab === 'games' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {gamesLoading ? 'Loading...' : `${liveGames.length} games today${live.length ? ` · ${live.length} live` : ''}`}
            </p>
            <button
              onClick={() => { setGamesTs(0); setLiveGames([]); }}
              className="rounded-lg border border-slate-800 px-3 py-1 text-xs text-slate-400 hover:bg-slate-900 hover:text-white"
            >
              Refresh
            </button>
          </div>

          {gamesError && <div className="rounded-xl border border-rose-800 bg-rose-950/50 p-4 text-sm text-rose-300">{gamesError}</div>}

          {live.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-red-400">Live Now</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {live.map((g) => <ScoreCard key={g.id} game={g} />)}
              </div>
            </div>
          )}

          {upcoming.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Today's Games</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {upcoming.map((g) => <ScoreCard key={g.id} game={g} />)}
              </div>
            </div>
          )}

          {finished.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Final</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {finished.map((g) => <ScoreCard key={g.id} game={g} />)}
              </div>
            </div>
          )}

          {!gamesLoading && liveGames.length === 0 && !gamesError && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-400">
              No games found today. ESPN may be down or there are no scheduled games.
            </div>
          )}
        </div>
      )}

      {/* ═══ BETTING ODDS ═══ */}
      {activeTab === 'odds' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <select
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              value={bookmaker}
              onChange={(e) => setBookmaker(e.target.value)}
            >
              <option value="all">All sportsbooks</option>
              {[...new Set((odds ?? []).flatMap((g) => (g.bookmakers ?? []).map((b: any) => b.key as string)))].filter(Boolean).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <button
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 hover:bg-slate-900"
              onClick={() => setFormat(format === 'american' ? 'decimal' : 'american')}
            >
              Format: {format}
            </button>
            <span className="ml-auto self-center text-xs text-slate-500">{oddsRows.length} lines</span>
          </div>

          {oddsRows.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center">
              <p className="text-slate-400">No odds available.</p>
              <p className="mt-1 text-xs text-slate-600">Set <code className="text-slate-400">ODDS_API_KEY</code> in Vercel environment variables.</p>
            </div>
          ) : (
            <>
              {/* group by game */}
              {(odds ?? []).map((game: any) => {
                const gameRows = (game.bookmakers ?? [])
                  .filter((b: any) => bookmaker === 'all' || b.key === bookmaker)
                  .flatMap((book: any) =>
                    Object.entries(book.markets ?? {}).flatMap(([mk, outs]) =>
                      (Array.isArray(outs) ? outs : []).map((o: any) => ({ book, mk, o }))
                    )
                  );
                if (!gameRows.length) return null;
                return (
                  <div key={game.gameId} className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                    <div className="border-b border-slate-800 bg-black px-4 py-2">
                      <span className="font-semibold text-white">{game.awayTeam} @ {game.homeTeam}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-slate-100">
                        <thead className="bg-slate-900 text-left text-xs text-slate-400">
                          <tr>
                            <th className="px-4 py-2">Book</th>
                            <th className="px-4 py-2">Market</th>
                            <th className="px-4 py-2">Outcome</th>
                            <th className="px-4 py-2">Price</th>
                            <th className="px-4 py-2">Point</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gameRows.slice(0, 60).map((row: any, i: number) => (
                            <tr key={i} className="border-t border-slate-800/50 hover:bg-slate-900/50">
                              <td className="px-4 py-2 text-slate-300">{row.book.title}</td>
                              <td className="px-4 py-2 text-slate-400">{row.mk}</td>
                              <td className="px-4 py-2">{row.o.name}</td>
                              <td className={`px-4 py-2 font-bold ${(row.o.price ?? 0) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {format === 'american' ? toAmericanOdds(row.o.price) : toDecimalOdds(row.o.price)}
                              </td>
                              <td className="px-4 py-2 text-slate-400">{row.o.point != null ? row.o.point : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ═══ PLAYER PROPS / ANALYSIS ═══ */}
      {activeTab === 'players' && (
        <div className="space-y-4">
          {analysisLoading && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-400">
              Loading player props...
            </div>
          )}
          {analysisError && (
            <div className="rounded-xl border border-rose-800 bg-rose-950/50 p-4 text-rose-300 text-sm">{analysisError}</div>
          )}
          {analysisData && !analysisLoading && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Source: <span className="text-slate-300">{analysisData.source}</span>
                  {' · '}{filteredPlayers.length} players
                  {' · '}Updated {new Date(analysisData.generatedAt).toLocaleTimeString()}
                </p>
                <button
                  className="rounded-lg border border-slate-800 px-3 py-1 text-xs text-slate-400 hover:bg-slate-900 hover:text-white"
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

      {/* ═══ ROSTER & AVERAGES ═══ */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <input
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Search player..."
              value={rosterSearch}
              onChange={(e) => setRosterSearch(e.target.value)}
            />
            <select
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              value={rosterTeam}
              onChange={(e) => setRosterTeam(e.target.value)}
            >
              <option value="">All teams</option>
              {rosterTeams.map((t) => (
                <option key={t.abbreviation} value={t.abbreviation}>{t.abbreviation} – {t.name}</option>
              ))}
            </select>
            <span className="ml-auto self-center text-xs text-slate-500">{filteredRoster.length} players</span>
          </div>

          {rosterLoading && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-400">Loading roster...</div>
          )}

          {!rosterLoading && (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-sm">
                <thead className="bg-black text-left text-xs text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3 text-right">PTS avg</th>
                    <th className="px-4 py-3 text-right">REB avg</th>
                    <th className="px-4 py-3 text-right">AST avg</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoster.map((p) => (
                    <tr key={p.id} className="border-t border-slate-800/50 hover:bg-slate-900/40">
                      <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                          {p.team?.abbreviation ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-orange-400">{p.points.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right text-slate-300">{p.rebounds.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right text-slate-300">{p.assists.toFixed(1)}</td>
                    </tr>
                  ))}
                  {filteredRoster.length === 0 && !rosterLoading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No players found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ BET TRACKER ═══ */}
      {activeTab === 'tracker' && <BetTracker />}
    </div>
  );
}
