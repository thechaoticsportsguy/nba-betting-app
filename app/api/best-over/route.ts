import { NextResponse } from 'next/server';
import playersData from '@/data/players.json';
import { fetchOddsPlayerProps } from '@/lib/oddsPlayerProps';

type BestOverItem = {
  player: string;
  team: string;
  game: string;
  statType: 'PTS' | 'REB' | 'AST' | '3PM';
  line: number;
  recentAvg: number;
  edge: number;
  odds: number | null;
  sportsbook: string;
  recommendation: 'Strong Over' | 'Lean Over';
};

const ODDS_KEY = process.env.ODDS_API_KEY;
const BALLDONTLIE_KEY = process.env.BALLDONTLIE_API_KEY;

export const revalidate = 30;

const marketToStat = (m: string): BestOverItem['statType'] | null => {
  if (m === 'player_points') return 'PTS';
  if (m === 'player_rebounds') return 'REB';
  if (m === 'player_assists') return 'AST';
  if (m === 'player_threes') return '3PM';
  return null;
};

export async function GET() {
  if (!ODDS_KEY) {
    return NextResponse.json({ error: 'ODDS_API_KEY is not configured', players: [] }, { status: 500 });
  }

  try {
    const [offers, liveRes] = await Promise.all([
      fetchOddsPlayerProps(ODDS_KEY),
      BALLDONTLIE_KEY
        ? fetch('https://api.balldontlie.io/v1/box_scores/live', {
            headers: { Authorization: BALLDONTLIE_KEY },
            next: { revalidate: 15 }
          })
        : Promise.resolve(new Response(JSON.stringify({ data: [] }), { status: 200 }))
    ]);

    const liveData = liveRes.ok ? await liveRes.json() : { data: [] };

    const liveMap = new Map<string, { pts: number; reb: number; ast: number; fg3m: number }>();
    for (const g of Array.isArray(liveData.data) ? liveData.data : []) {
      for (const s of Array.isArray(g.stats) ? g.stats : []) {
        const name = `${s.player?.first_name ?? ''} ${s.player?.last_name ?? ''}`.trim().toLowerCase();
        if (!name) continue;
        liveMap.set(name, {
          pts: Number(s.pts ?? 0),
          reb: Number(s.reb ?? 0),
          ast: Number(s.ast ?? 0),
          fg3m: Number(s.fg3m ?? 0)
        });
      }
    }

    const fallback = playersData as Array<{ name: string; points: number; rebounds: number; assists: number }>;
    const players: BestOverItem[] = [];

    for (const offer of offers) {
      const statType = marketToStat(offer.marketKey);
      if (!statType) continue;

      const live = liveMap.get(offer.playerName.toLowerCase());
      const fb = fallback.find((p) => p.name.toLowerCase() === offer.playerName.toLowerCase());
      const base =
        statType === 'PTS' ? fb?.points ?? live?.pts ?? 0 :
        statType === 'REB' ? fb?.rebounds ?? live?.reb ?? 0 :
        statType === 'AST' ? fb?.assists ?? live?.ast ?? 0 :
        live?.fg3m ?? 1.8;
      const liveVal =
        statType === 'PTS' ? live?.pts ?? base :
        statType === 'REB' ? live?.reb ?? base :
        statType === 'AST' ? live?.ast ?? base :
        live?.fg3m ?? base;

      const recentAvg = Number((base * 0.75 + liveVal * 0.25).toFixed(2));
      if (recentAvg <= offer.line) continue;

      const edge = Number((recentAvg - offer.line).toFixed(2));
      players.push({
        player: offer.playerName,
        team: 'N/A',
        game: `${offer.awayTeam} vs ${offer.homeTeam}`,
        statType,
        line: offer.line,
        recentAvg,
        edge,
        odds: offer.price,
        sportsbook: offer.sportsbook,
        recommendation: edge >= 3 ? 'Strong Over' : 'Lean Over'
      });
    }

    const deduped = Object.values(
      players.reduce<Record<string, BestOverItem>>((acc, p) => {
        const key = `${p.player}-${p.statType}`;
        if (!acc[key] || p.edge > acc[key].edge) acc[key] = p;
        return acc;
      }, {})
    ).sort((a, b) => b.edge - a.edge);

    return NextResponse.json({ generatedAt: new Date().toISOString(), players: deduped.slice(0, 40) });
  } catch {
    return NextResponse.json({ error: 'Failed to generate best-over players', players: [] }, { status: 500 });
  }
}
