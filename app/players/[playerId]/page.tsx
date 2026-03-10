import Link from 'next/link';
import PlayerStatsChart from '@/components/PlayerStatsChart';
import type { BDLPlayer, BDLSeasonAverages, BDLGameStats } from '@/lib/types';
import { pct } from '@/lib/format';

interface PlayerData {
  player: BDLPlayer;
  seasonAverages: BDLSeasonAverages | null;
  recentGames: BDLGameStats[];
}

async function fetchPlayer(id: string): Promise<PlayerData | null> {
  const apiKey = process.env.BALLDONTLIE_API_KEY;
  if (!apiKey) return null;

  const headers = { Authorization: apiKey };
  const base = 'https://api.balldontlie.io/v1';

  try {
    const [playerRes, avgRes, statsRes] = await Promise.all([
      fetch(`${base}/players/${id}`, { headers, next: { revalidate: 600 } }),
      fetch(`${base}/season_averages?player_ids[]=${id}`, { headers, next: { revalidate: 600 } }),
      fetch(`${base}/stats?player_ids[]=${id}&per_page=15`, { headers, next: { revalidate: 600 } }),
    ]);

    if (!playerRes.ok) return null;

    const player = (await playerRes.json()).data as BDLPlayer;
    const avgData = await avgRes.json();
    const statsData = await statsRes.json();

    return {
      player,
      seasonAverages: avgData.data?.[0] ?? null,
      recentGames: statsData.data ?? [],
    };
  } catch {
    return null;
  }
}

export default async function PlayerPage({ params }: { params: { playerId: string } }) {
  const data = await fetchPlayer(params.playerId);

  if (!data) {
    return (
      <div className="space-y-4">
        <Link href="/" className="text-sm text-court hover:underline">Back</Link>
        <p className="text-slate-400">
          Player not found. Make sure <code className="text-xs bg-slate-800 px-1 rounded">BALLDONTLIE_API_KEY</code> is set.
        </p>
      </div>
    );
  }

  const { player, seasonAverages, recentGames } = data;

  return (
    <div className="space-y-8">
      <Link href="/" className="text-sm text-court hover:underline">Back</Link>

      {/* Player header */}
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-2xl font-bold">{player.first_name} {player.last_name}</h1>
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-400">
          <span>{player.team.full_name}</span>
          {player.position && <span>#{player.jersey_number} · {player.position}</span>}
          {player.height && <span>{player.height}</span>}
          {player.weight && <span>{player.weight} lbs</span>}
          {player.college && <span>{player.college}</span>}
          {player.country && <span>{player.country}</span>}
        </div>
      </section>

      {/* Season averages */}
      {seasonAverages && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Season Averages</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-10">
            {[
              { label: 'GP', value: seasonAverages.games_played },
              { label: 'MIN', value: seasonAverages.min },
              { label: 'PTS', value: seasonAverages.pts },
              { label: 'REB', value: seasonAverages.reb },
              { label: 'AST', value: seasonAverages.ast },
              { label: 'STL', value: seasonAverages.stl },
              { label: 'BLK', value: seasonAverages.blk },
              { label: 'FG%', value: pct(seasonAverages.fg_pct) },
              { label: '3P%', value: pct(seasonAverages.fg3_pct) },
              { label: 'FT%', value: pct(seasonAverages.ft_pct) },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-slate-900 border border-slate-800 p-3 text-center">
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent performance chart */}
      {recentGames.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Recent Performance</h2>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <PlayerStatsChart games={recentGames} />
          </div>
        </section>
      )}

      {/* Recent game log */}
      {recentGames.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Game Log</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400">
                  <th className="pb-2 pr-4 text-left">Date</th>
                  <th className="pb-2 px-2 text-right">MIN</th>
                  <th className="pb-2 px-2 text-right">PTS</th>
                  <th className="pb-2 px-2 text-right">REB</th>
                  <th className="pb-2 px-2 text-right">AST</th>
                  <th className="pb-2 px-2 text-right">STL</th>
                  <th className="pb-2 px-2 text-right">BLK</th>
                </tr>
              </thead>
              <tbody>
                {recentGames.map((g) => (
                  <tr key={g.id} className="border-b border-slate-800/50">
                    <td className="py-1.5 pr-4">{new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td className="py-1.5 px-2 text-right text-slate-400">{g.min}</td>
                    <td className="py-1.5 px-2 text-right font-semibold">{g.pts}</td>
                    <td className="py-1.5 px-2 text-right">{g.reb}</td>
                    <td className="py-1.5 px-2 text-right">{g.ast}</td>
                    <td className="py-1.5 px-2 text-right">{g.stl}</td>
                    <td className="py-1.5 px-2 text-right">{g.blk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
