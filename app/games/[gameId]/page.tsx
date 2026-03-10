import Link from 'next/link';
import { toETFull } from '@/lib/format';
import type { LiveGame, NormalizedOddsLine } from '@/lib/types';

async function fetchGame(gameId: string): Promise<LiveGame | null> {
  try {
    const res = await fetch(
      `https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`,
      { next: { revalidate: 30 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const hdr = json.header;
    if (!hdr) return null;

    const comp = hdr.competitions?.[0];
    if (!comp) return null;

    const away = comp.competitors?.find((c: { homeAway: string }) => c.homeAway === 'away');
    const home = comp.competitors?.find((c: { homeAway: string }) => c.homeAway === 'home');
    if (!away || !home) return null;

    return {
      id: gameId,
      date: hdr.gameNote ?? '',
      state: json.header?.competitions?.[0]?.status?.type?.state ?? 'pre',
      shortDetail: json.header?.competitions?.[0]?.status?.type?.shortDetail ?? '',
      period: json.header?.competitions?.[0]?.status?.period ?? 0,
      clock: json.header?.competitions?.[0]?.status?.displayClock ?? '',
      awayTeam: {
        id: away.id,
        abbr: away.team?.abbreviation ?? '',
        name: away.team?.displayName ?? '',
        logo: away.team?.logos?.[0]?.href ?? '',
        score: parseInt(away.score ?? '0', 10),
        record: away.record ?? '',
      },
      homeTeam: {
        id: home.id,
        abbr: home.team?.abbreviation ?? '',
        name: home.team?.displayName ?? '',
        logo: home.team?.logos?.[0]?.href ?? '',
        score: parseInt(home.score ?? '0', 10),
        record: home.record ?? '',
      },
      broadcast: '',
    } as LiveGame;
  } catch {
    return null;
  }
}

async function fetchOddsForGame(gameId: string): Promise<NormalizedOddsLine[]> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${base}/api/odds`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.lines ?? []).filter((l: NormalizedOddsLine) => l.gameId === gameId);
  } catch {
    return [];
  }
}

interface BoxPlayer {
  athlete: { displayName: string; position: { abbreviation: string } };
  stats: string[];
}

interface BoxTeam {
  team: { displayName: string };
  statistics: { labels: string[]; athletes: BoxPlayer[] }[];
}

async function fetchBoxScore(gameId: string): Promise<BoxTeam[]> {
  try {
    const res = await fetch(
      `https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.boxscore?.players ?? [];
  } catch {
    return [];
  }
}

export default async function GamePage({ params }: { params: { gameId: string } }) {
  const [game, odds, boxTeams] = await Promise.all([
    fetchGame(params.gameId),
    fetchOddsForGame(params.gameId),
    fetchBoxScore(params.gameId),
  ]);

  if (!game) {
    return (
      <div className="space-y-4">
        <Link href="/" className="text-sm text-court hover:underline">Back to scoreboard</Link>
        <p className="text-slate-400">Game not found or ESPN data unavailable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/" className="text-sm text-court hover:underline">Back to scoreboard</Link>

      {/* Score header */}
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {game.awayTeam.logo && <img src={game.awayTeam.logo} alt={game.awayTeam.name} className="h-14 w-14" />}
            <div>
              <p className="text-lg font-bold">{game.awayTeam.name}</p>
              <p className="text-sm text-slate-400">{game.awayTeam.record}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black">{game.awayTeam.score} - {game.homeTeam.score}</p>
            <p className="text-sm text-slate-400">{game.shortDetail}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-bold">{game.homeTeam.name}</p>
              <p className="text-sm text-slate-400">{game.homeTeam.record}</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {game.homeTeam.logo && <img src={game.homeTeam.logo} alt={game.homeTeam.name} className="h-14 w-14" />}
          </div>
        </div>
        {game.date && <p className="mt-3 text-xs text-slate-500">{toETFull(game.date)}</p>}
      </section>

      {/* Box score */}
      {boxTeams.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Box Score</h2>
          {boxTeams.map((bt) => {
            const stats = bt.statistics?.[0];
            if (!stats) return null;
            return (
              <div key={bt.team.displayName} className="space-y-2">
                <h3 className="font-semibold">{bt.team.displayName}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs text-slate-400">
                        <th className="pb-1 pr-3 text-left">Player</th>
                        {stats.labels.map((l) => (
                          <th key={l} className="pb-1 px-2 text-right">{l}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.athletes.map((a) => (
                        <tr key={a.athlete.displayName} className="border-b border-slate-800/50">
                          <td className="py-1 pr-3 font-medium">{a.athlete.displayName}</td>
                          {a.stats.map((s, i) => (
                            <td key={i} className="py-1 px-2 text-right text-slate-300">{s}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Betting lines */}
      {odds.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Betting Lines</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400">
                  <th className="pb-2 pr-4 text-left">Bookmaker</th>
                  <th className="pb-2 pr-4 text-left">Market</th>
                  <th className="pb-2 text-left">Outcomes</th>
                </tr>
              </thead>
              <tbody>
                {odds.map((line, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    <td className="py-2 pr-4">{line.bookmaker}</td>
                    <td className="py-2 pr-4">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-xs">
                        {line.market === 'h2h' ? 'Moneyline' : line.market === 'spreads' ? 'Spread' : 'Totals'}
                      </span>
                    </td>
                    <td className="py-2">
                      {line.outcomes.map((o, j) => (
                        <span key={j} className="mr-3 text-xs">
                          {o.name} {o.point !== undefined && `(${o.point > 0 ? '+' : ''}${o.point})`}{' '}
                          <span className="font-semibold text-court">{o.price > 0 ? '+' : ''}{o.price}</span>
                        </span>
                      ))}
                    </td>
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
