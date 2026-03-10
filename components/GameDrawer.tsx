'use client';

import { useEffect, useMemo, useState } from 'react';
import BettingMarkets from '@/components/BettingMarkets';
import GameHeader from '@/components/GameHeader';
import LiveBoxScoreTable from '@/components/LiveBoxScoreTable';
import { ESPNGame, LiveBoxScoreResponse, MergedGame, OddsResponse } from '@/lib/types';
import { findMatchingBoxScore, findMatchingOdds, getEspnMatchupKey } from '@/lib/matchGameData';

type TabKey = 'box' | 'betting' | 'info';

export default function GameDrawer({ game, onClose }: { game: ESPNGame | null; onClose: () => void }) {
  const [box, setBox] = useState<LiveBoxScoreResponse | null>(null);
  const [odds, setOdds] = useState<OddsResponse | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('box');

  useEffect(() => {
    if (!game) return;
    const load = async () => {
      const [boxRes, oddsRes] = await Promise.allSettled([
        fetch('/api/live-boxscore', { cache: 'no-store' }).then((r) => r.json()),
        fetch('/api/odds', { cache: 'no-store' }).then((r) => r.json())
      ]);
      if (boxRes.status === 'fulfilled') setBox(boxRes.value);
      if (oddsRes.status === 'fulfilled') setOdds(oddsRes.value);
    };

    load();
    const boxInterval = setInterval(load, 12_000);
    return () => clearInterval(boxInterval);
  }, [game]);

  const merged: MergedGame | null = useMemo(() => {
    if (!game) return null;
    const matchedBox = box ? findMatchingBoxScore(game, box.games ?? []) : undefined;
    const matchedOdds = odds ? findMatchingOdds(game, odds.games ?? []) : undefined;
    return {
      id: game.id,
      espnEventId: game.espnEventId,
      matchupKey: getEspnMatchupKey(game),
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      status: game.status,
      period: game.period,
      clock: game.clock,
      startTime: game.startTime,
      isLive: game.isLive,
      venue: game.venue,
      broadcast: game.broadcast,
      boxScore: matchedBox
        ? { homePlayers: matchedBox.homeTeam.players, awayPlayers: matchedBox.awayTeam.players }
        : undefined,
      odds: matchedOdds
        ? { bookmakers: matchedOdds.bookmakers, bestOdds: matchedOdds.bestOdds }
        : undefined
    };
  }, [game, box, odds]);

  if (!game || !merged) return null;

  return (
    <>
      <button className="fixed inset-0 z-30 bg-black/50" onClick={onClose} aria-label="Close drawer overlay" />
      <aside className="fixed right-0 top-0 z-40 h-full w-full overflow-y-auto bg-white p-4 text-slate-900 shadow-2xl sm:w-[520px]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Game Details</h2>
          <button onClick={onClose} className="rounded-md border border-slate-300 px-2 py-1 text-sm">Close</button>
        </div>

        <GameHeader game={merged} />

        <div className="mb-4 flex gap-2">
          <button className={`rounded-md px-3 py-1.5 text-sm ${activeTab === 'box' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`} onClick={() => setActiveTab('box')}>Box Score</button>
          <button className={`rounded-md px-3 py-1.5 text-sm ${activeTab === 'betting' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`} onClick={() => setActiveTab('betting')}>Betting</button>
          <button className={`rounded-md px-3 py-1.5 text-sm ${activeTab === 'info' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`} onClick={() => setActiveTab('info')}>Game Info</button>
        </div>

        {activeTab === 'box' ? (
          <div className="space-y-4">
            <LiveBoxScoreTable title={`${merged.awayTeam.abbreviation} Players`} players={merged.boxScore?.awayPlayers ?? []} />
            <LiveBoxScoreTable title={`${merged.homeTeam.abbreviation} Players`} players={merged.boxScore?.homePlayers ?? []} />
            {!merged.boxScore ? <p className="text-sm text-slate-500">Live box score unavailable.</p> : null}
          </div>
        ) : null}

        {activeTab === 'betting' ? (
          <BettingMarkets
            odds={
              merged.odds?.bestOdds
                ? {
                    gameId: merged.id,
                    homeTeam: merged.homeTeam.name,
                    awayTeam: merged.awayTeam.name,
                    bookmakers: merged.odds.bookmakers,
                    bestOdds: merged.odds.bestOdds
                  }
                : undefined
            }
          />
        ) : null}

        {activeTab === 'info' ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p><span className="font-semibold">Start:</span> {merged.startTime ? new Date(merged.startTime).toLocaleString() : 'TBD'}</p>
            <p><span className="font-semibold">Venue:</span> {merged.venue ?? 'Unavailable'}</p>
            <p><span className="font-semibold">Broadcast:</span> {merged.broadcast ?? 'Unavailable'}</p>
            <p><span className="font-semibold">Status:</span> {merged.status}</p>
            <p className="text-xs text-slate-500">ESPN Event ID: {merged.espnEventId}</p>
          </div>
        ) : null}
      </aside>
    </>
  );
}
