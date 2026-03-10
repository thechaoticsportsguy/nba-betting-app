'use client';

import { useEffect, useMemo, useState } from 'react';
import { GameOdds, LiveBoxScore, LiveGame } from '@/lib/types';
import BoxScoreTable from '@/components/BoxScoreTable';
import BettingOdds from '@/components/BettingOdds';

export default function GamePanel({ game, onClose }: { game: LiveGame | null; onClose: () => void }) {
  const [boxScore, setBoxScore] = useState<LiveBoxScore | null>(null);
  const [odds, setOdds] = useState<GameOdds | null>(null);

  useEffect(() => {
    if (!game) {
      return;
    }

    const loadBox = async () => {
      const res = await fetch(`/api/live-boxscore?gameId=${game.id}`, { cache: 'no-store' });
      const payload = await res.json();
      setBoxScore(payload.boxScore ?? null);
    };

    loadBox();
    const interval = setInterval(loadBox, 10_000);
    return () => clearInterval(interval);
  }, [game]);

  useEffect(() => {
    if (!game) {
      return;
    }

    const loadOdds = async () => {
      const res = await fetch('/api/odds', { cache: 'no-store' });
      const payload = await res.json();
      const list: GameOdds[] = payload.odds ?? [];
      const found = list.find((o) => o.gameId === game.id) ?? list.find((o) => o.home.team === game.homeTeam.name && o.away.team === game.awayTeam.name) ?? null;
      setOdds(found);
    };

    loadOdds();
    const interval = setInterval(loadOdds, 30_000);
    return () => clearInterval(interval);
  }, [game]);

  const title = useMemo(() => {
    if (!game) return '';
    return `${game.awayTeam.abbreviation} @ ${game.homeTeam.abbreviation}`;
  }, [game]);

  if (!game) return null;

  return (
    <aside className="fixed right-0 top-0 z-20 h-full w-[420px] overflow-scroll bg-white p-4 text-slate-900 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={onClose} className="rounded bg-slate-100 px-2 py-1 text-sm">Close</button>
      </div>

      <p className="mb-3 text-sm text-slate-600">{game.status}</p>

      <div className="space-y-4">
        <BoxScoreTable title={boxScore?.awayTeam ?? 'Away Team Players'} players={boxScore?.awayPlayers ?? []} />
        <BoxScoreTable title={boxScore?.homeTeam ?? 'Home Team Players'} players={boxScore?.homePlayers ?? []} />
      </div>

      <BettingOdds odds={odds} />
    </aside>
  );
}
