import { NextRequest, NextResponse } from 'next/server';
import { BoxScorePlayer, LiveBoxScore } from '@/lib/types';

const BALLDONTLIE_BOX_URL = 'https://api.balldontlie.io/v1/box_scores/live';
const BALLDONTLIE_KEY = process.env.BALLDONTLIE_API_KEY ?? '5961d28b-ac82-4980-ba1e-de7454c1511a';

export const revalidate = 10;

const toPlayer = (item: any): BoxScorePlayer => ({
  playerId: Number(item.player?.id ?? 0),
  playerName: `${item.player?.first_name ?? ''} ${item.player?.last_name ?? ''}`.trim() || 'Unknown',
  teamId: Number(item.team?.id ?? 0),
  teamName: item.team?.full_name ?? 'Unknown',
  teamAbbreviation: item.team?.abbreviation ?? 'UNK',
  minutes: item.min ?? '0',
  points: Number(item.pts ?? 0),
  rebounds: Number(item.reb ?? 0),
  assists: Number(item.ast ?? 0),
  steals: Number(item.stl ?? 0),
  blocks: Number(item.blk ?? 0),
  fgPct: Number(item.fg_pct ?? 0),
  plusMinus: Number(item.plus_minus ?? 0)
});

export async function GET(request: NextRequest) {
  const gameId = request.nextUrl.searchParams.get('gameId');

  try {
    const response = await fetch(BALLDONTLIE_BOX_URL, {
      headers: { Authorization: BALLDONTLIE_KEY },
      next: { revalidate: 10 }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch live box scores' }, { status: 502 });
    }

    const payload = await response.json();
    const data = Array.isArray(payload.data) ? payload.data : [];

    const selected = gameId ? data.find((g: any) => String(g.game?.id) === gameId) : data[0];
    if (!selected) {
      return NextResponse.json({ boxScore: null });
    }

    const stats = Array.isArray(selected.stats) ? selected.stats : [];
    const homeTeamId = Number(selected.game?.home_team_id ?? 0);
    const awayTeamId = Number(selected.game?.visitor_team_id ?? 0);

    const homePlayers = stats.filter((s: any) => Number(s.team?.id) === homeTeamId).map(toPlayer);
    const awayPlayers = stats.filter((s: any) => Number(s.team?.id) === awayTeamId).map(toPlayer);

    const boxScore: LiveBoxScore = {
      gameId: String(selected.game?.id ?? gameId ?? ''),
      homeTeam: selected.game?.home_team?.full_name ?? 'Home Team',
      awayTeam: selected.game?.visitor_team?.full_name ?? 'Away Team',
      homePlayers,
      awayPlayers
    };

    return NextResponse.json({ boxScore });
  } catch {
    return NextResponse.json({ error: 'Unexpected error loading box score' }, { status: 500 });
  }
}
