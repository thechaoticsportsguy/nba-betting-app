import LiveScoreboard from '@/components/LiveScoreboard';
import OddsTicker from '@/components/OddsTicker';
import type { LiveGame } from '@/lib/types';

async function fetchLiveGames(): Promise<LiveGame[]> {
  try {
    const res = await fetch(
      'https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
      { next: { revalidate: 30 } },
    );
    if (!res.ok) return [];
    const json = await res.json();
    const events = json.events ?? [];
    return events.map((event: Record<string, unknown>) => {
      const e = event as {
        id: string;
        date: string;
        status: { type: { state: string; shortDetail: string }; period: number; displayClock: string };
        competitions: {
          competitors: {
            homeAway: string;
            team: { id: string; abbreviation: string; displayName: string; logo: string };
            score: string;
            records?: { summary: string }[];
          }[];
          broadcasts?: { names: string[] }[];
        }[];
      };
      const comp = e.competitions[0];
      const away = comp.competitors.find((c) => c.homeAway === 'away')!;
      const home = comp.competitors.find((c) => c.homeAway === 'home')!;
      return {
        id: e.id,
        date: e.date,
        state: e.status.type.state,
        shortDetail: e.status.type.shortDetail,
        period: e.status.period,
        clock: e.status.displayClock,
        awayTeam: {
          id: away.team.id,
          abbr: away.team.abbreviation,
          name: away.team.displayName,
          logo: away.team.logo,
          score: parseInt(away.score, 10) || 0,
          record: away.records?.[0]?.summary,
        },
        homeTeam: {
          id: home.team.id,
          abbr: home.team.abbreviation,
          name: home.team.displayName,
          logo: home.team.logo,
          score: parseInt(home.score, 10) || 0,
          record: home.records?.[0]?.summary,
        },
        broadcast: comp.broadcasts?.[0]?.names?.[0] ?? '',
      } as LiveGame;
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const games = await fetchLiveGames();

  return (
    <div className="space-y-8">
      <OddsTicker />
      <LiveScoreboard initialGames={games} />
    </div>
  );
}
