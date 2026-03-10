'use client';

import { useEffect, useMemo, useState } from 'react';
import AnalysisSummaryCards from '@/components/AnalysisSummaryCards';
import BestOverTable from '@/components/BestOverTable';
import DashboardTabs, { DashboardTab } from '@/components/DashboardTabs';
import GameCard from '@/components/GameCard';
import GameDrawer from '@/components/GameDrawer';
import PlayerAnalysisFilters, { AnalysisFilterState } from '@/components/PlayerAnalysisFilters';
import PlayerAnalysisTable from '@/components/PlayerAnalysisTable';
import { BestOverPlayer, BestOverResponse, ESPNGame, PlayerAnalysis, PlayerAnalysisResponse } from '@/lib/types';

const defaultFilters: AnalysisFilterState = {
  team: '',
  statType: '',
  confidence: '',
  game: '',
  sortBy: 'edge',
  search: ''
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('live');

import { useEffect, useState } from 'react';
import GameCard from '@/components/GameCard';
import GameDrawer from '@/components/GameDrawer';
import { ESPNGame } from '@/lib/types';

export default function HomePage() {
  const [games, setGames] = useState<ESPNGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<ESPNGame | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [analysis, setAnalysis] = useState<PlayerAnalysisResponse | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalysisFilterState>(defaultFilters);

  const [bestOver, setBestOver] = useState<BestOverPlayer[]>([]);
  const [bestOverLoading, setBestOverLoading] = useState(false);
  const [bestOverError, setBestOverError] = useState<string | null>(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const res = await fetch('/api/live-games', { cache: 'no-store' });
        const payload = await res.json();
        setGames(payload.games ?? []);
        setError(null);
      } catch {
        setError('Unable to load live games right now.');
      } finally {
        setLoading(false);
      }
    };

    loadGames();
    const interval = setInterval(loadGames, 15_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab !== 'players') return;
    const loadAnalysis = async () => {
      setAnalysisLoading(true);
      try {
        const res = await fetch('/api/player-analysis', { cache: 'no-store' });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error ?? 'Unable to load analysis');
        setAnalysis(payload);
        setAnalysisError(null);
      } catch (e) {
        setAnalysisError(e instanceof Error ? e.message : 'Unable to load analysis');
      } finally {
        setAnalysisLoading(false);
      }
    };

    loadAnalysis();
    const interval = setInterval(loadAnalysis, 30_000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const generateBestOver = async () => {
    setBestOverLoading(true);
    try {
      const res = await fetch('/api/best-over', { cache: 'no-store' });
      const payload: BestOverResponse = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'Unable to generate over-performers');
      setBestOver(payload.players ?? []);
      setBestOverError(null);
    } catch (e) {
      setBestOverError(e instanceof Error ? e.message : 'Unable to generate over-performers');
      setBestOver([]);
    } finally {
      setBestOverLoading(false);
    }
  };

  const filteredPlayers = useMemo(() => {
    if (!analysis) return [];
    const base = analysis.players.filter((p) => {
      if (filters.team && p.team !== filters.team) return false;
      if (filters.statType && p.marketType !== filters.statType) return false;
      if (filters.confidence && p.confidence !== filters.confidence) return false;
      if (filters.game && p.game !== filters.game) return false;
      if (filters.search && !p.playerName.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });

    const sorted = [...base];
    sorted.sort((a: PlayerAnalysis, b: PlayerAnalysis) => {
      if (filters.sortBy === 'projected') return b.projectedValue - a.projectedValue;
      if (filters.sortBy === 'safest') {
        const rank = (v: PlayerAnalysis['confidence']) => (v === 'High' ? 3 : v === 'Medium' ? 2 : 1);
        return rank(b.confidence) - rank(a.confidence) || b.edge - a.edge;
      }
      if (filters.sortBy === 'boom') return b.boomScore - a.boomScore;
      return b.edge - a.edge;
    });

    return sorted;
  }, [analysis, filters]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-1 text-3xl font-bold">NBA Unified Live Dashboard</h1>
        <p className="mb-4 text-sm text-slate-400">Live games, box scores, player stats, betting odds — synced in one flow.</p>

        <DashboardTabs active={activeTab} onChange={setActiveTab} />

        {activeTab === 'live' ? (
          <>
            {error ? <p className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

            {loading ? (
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="h-44 animate-pulse rounded-2xl bg-slate-800" />
                ))}
              </section>
            ) : games.length === 0 ? (
              <p className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-slate-300">No live or upcoming NBA games currently available.</p>
            ) : (
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {games.map((game) => (
                  <GameCard key={game.id} game={game} onClick={setSelectedGame} />
                ))}
              </section>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={generateBestOver}
                disabled={bestOverLoading}
                className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-60"
              >
                {bestOverLoading ? 'Generating Over-Performers...' : 'Generate Over-Performers'}
              </button>
              {bestOverError ? <p className="text-sm text-rose-300">{bestOverError}</p> : null}
            </div>

            {bestOver.length > 0 ? <BestOverTable players={bestOver} /> : null}

            {analysisError ? <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">{analysisError}</p> : null}
            {analysisLoading && !analysis ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="h-24 animate-pulse rounded-2xl bg-slate-800" />)}
              </div>
            ) : null}

            {analysis ? (
              <>
                <AnalysisSummaryCards data={analysis} />
                <PlayerAnalysisFilters filters={filters} onChange={setFilters} players={analysis.players} />
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-slate-300">Best Value</h3>
                    <p className="text-sm text-slate-400">{analysis.summary.bestOverallValue ? `${analysis.summary.bestOverallValue.playerName} (${analysis.summary.bestOverallValue.marketType})` : 'Unavailable'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-slate-300">Trending / Hot Recent Form</h3>
                    <p className="text-sm text-slate-400">{analysis.players.find((p) => p.trend === 'Heating Up')?.playerName ?? 'No heating-up trend found.'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-slate-300">Riskier Boom Picks</h3>
                    <p className="text-sm text-slate-400">{[...analysis.players].sort((a, b) => b.boomScore - a.boomScore)[0]?.playerName ?? 'No boom picks available.'}</p>
                  </div>
                </div>
                <PlayerAnalysisTable players={filteredPlayers} />
              </>
            ) : null}
          </div>
        <p className="mb-6 text-sm text-slate-400">Live games, box scores, player stats, betting odds — synced in one flow.</p>

        {error ? <p className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

        {loading ? (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-44 animate-pulse rounded-2xl bg-slate-800" />
            ))}
          </section>
        ) : games.length === 0 ? (
          <p className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-slate-300">No live or upcoming NBA games currently available.</p>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard key={game.id} game={game} onClick={setSelectedGame} />
            ))}
          </section>
        )}
      </div>

      <GameDrawer game={selectedGame} onClose={() => setSelectedGame(null)} />
export const dynamic = 'force-dynamic';
import { headers } from 'next/headers';
import Navbar from '@/components/Navbar';
import LiveScoreboard from '@/components/LiveScoreboard';
import OddsTicker from '@/components/OddsTicker';

async function getLiveGames(baseUrl: string) {
  const res = await fetch(`${baseUrl}/api/live-games`, { next: { revalidate: 30 } });
  if (!res.ok) return { games: [] };
  return res.json();
}

async function getOdds(baseUrl: string) {
  const res = await fetch(`${baseUrl}/api/odds`, { next: { revalidate: 30 } });
  if (!res.ok) return { odds: [] };
  return res.json();
}

export default async function HomePage() {
  const host = headers().get('host') ?? 'localhost:3000';
  const baseUrl = /^(localhost|127\.0\.0\.1)/.test(host) ? `http://${host}` : `https://${host}`;
  const [{ games }, { odds }] = await Promise.all([getLiveGames(baseUrl), getOdds(baseUrl)]);

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <h1 className="text-2xl font-bold">Live NBA Scoreboard</h1>
        <OddsTicker odds={odds} />
        <LiveScoreboard games={games} />
      </div>
    </main>
  );
}
