'use client';

import { useMemo, useState } from 'react';

type Tab = 'summary' | 'stats' | 'betting';

function moneylineForGame(oddsGames: any[], home?: string, away?: string) {
  return (oddsGames ?? []).find((g) => g.homeTeam === home && g.awayTeam === away);
}

export default function GameTabs({ summary, boxScores, betting }: { summary: any; boxScores: any; betting: any }) {
  const [tab, setTab] = useState<Tab>('summary');

  const competition = summary?.header?.competitions?.[0];
  const homeName = competition?.competitors?.find((c: any) => c.homeAway === 'home')?.team?.displayName;
  const awayName = competition?.competitors?.find((c: any) => c.homeAway === 'away')?.team?.displayName;

  const gameOdds = useMemo(() => moneylineForGame(betting?.odds ?? [], homeName, awayName), [betting, homeName, awayName]);

  const statsByTeam = useMemo(() => {
    const games = Array.isArray(boxScores?.data) ? boxScores.data : [];
    const current = games.find((g: any) => String(g?.game?.id) === String(summary?.header?.id));
    if (!current) return { home: [], away: [] };

    const players = Array.isArray(current?.stats) ? current.stats : [];
    const home = players.filter((p: any) => p.team?.id === current?.game?.home_team_id);
    const away = players.filter((p: any) => p.team?.id === current?.game?.visitor_team_id);
    return { home, away };
  }, [boxScores, summary]);

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex gap-2">
        {(['summary', 'stats', 'betting'] as const).map((t) => (
          <button key={t} className={`rounded-md px-3 py-1 text-sm ${tab === t ? 'bg-slate-900 text-white' : 'bg-slate-100'}`} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'summary' && (
        <div className="space-y-3 text-sm">
          <p>{summary?.header?.competitions?.[0]?.notes?.[0]?.headline ?? 'Live game summary unavailable.'}</p>
          <div className="rounded-lg border border-slate-200">
            {(summary?.plays ?? []).slice(0, 12).map((play: any, idx: number) => (
              <p key={idx} className="border-b px-3 py-2 last:border-b-0">{play.text}</p>
            ))}
          </div>
        </div>
      )}

      {tab === 'stats' && (
        <div className="space-y-4 text-sm">
          <p className="text-slate-600">Live player box stats (PTS / REB / AST)</p>
          {statsByTeam.home.length === 0 && statsByTeam.away.length === 0 ? (
            <p className="rounded border border-slate-200 p-3 text-slate-500">No live player stats currently available for this game.</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {[{ name: awayName ?? 'Away', rows: statsByTeam.away }, { name: homeName ?? 'Home', rows: statsByTeam.home }].map((team) => (
                <div key={team.name} className="overflow-hidden rounded-lg border border-slate-200">
                  <div className="bg-slate-50 px-3 py-2 font-semibold">{team.name}</div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50 text-left text-xs text-slate-500">
                        <th className="px-3 py-2">Player</th><th className="px-3 py-2">PTS</th><th className="px-3 py-2">REB</th><th className="px-3 py-2">AST</th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.rows.slice(0, 12).map((p: any, i: number) => (
                        <tr key={i} className="border-b last:border-b-0">
                          <td className="px-3 py-2">{p.player?.first_name} {p.player?.last_name}</td>
                          <td className="px-3 py-2 font-semibold">{p.pts ?? 0}</td>
                          <td className="px-3 py-2">{p.reb ?? 0}</td>
                          <td className="px-3 py-2">{p.ast ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'betting' && (
        <div className="space-y-3 text-sm">
          <p className="text-slate-600">Best live lines (moneyline, spread, totals)</p>
          {!gameOdds ? (
            <p className="rounded border border-slate-200 p-3 text-slate-500">No odds found for this matchup yet.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Moneyline</p><p className="font-semibold">{awayName}: {gameOdds.bestOdds?.moneyline?.away ?? '—'}</p><p className="font-semibold">{homeName}: {gameOdds.bestOdds?.moneyline?.home ?? '—'}</p></div>
              <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Spread</p><p className="font-semibold">{awayName}: {gameOdds.bestOdds?.spread?.away?.point ?? '—'} ({gameOdds.bestOdds?.spread?.away?.price ?? '—'})</p><p className="font-semibold">{homeName}: {gameOdds.bestOdds?.spread?.home?.point ?? '—'} ({gameOdds.bestOdds?.spread?.home?.price ?? '—'})</p></div>
              <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Total</p><p className="font-semibold">Over: {gameOdds.bestOdds?.total?.over?.point ?? '—'} ({gameOdds.bestOdds?.total?.over?.price ?? '—'})</p><p className="font-semibold">Under: {gameOdds.bestOdds?.total?.under?.point ?? '—'} ({gameOdds.bestOdds?.total?.under?.price ?? '—'})</p></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
