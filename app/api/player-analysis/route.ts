import { NextResponse } from 'next/server';
import playersData from '@/data/players.json';
import { fetchOddsPlayerProps } from '@/lib/oddsPlayerProps';
import { PlayerAnalysis, PlayerAnalysisResponse } from '@/lib/types';
import { PlayerAnalysis, PlayerAnalysisResponse, PlayerStat } from '@/lib/types';

const ODDS_KEY = process.env.ODDS_API_KEY;
const BALLDONTLIE_KEY = process.env.BALLDONTLIE_API_KEY;

export const revalidate = 30;

const asNum = (v: unknown, d = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : d);

const parseMin = (min: string): number => {
  const [m, s] = (min || '0:00').split(':');
  return Number(m || 0) + Number(s || 0) / 60;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const scoreTrend = (r5: number, r10: number): 'Heating Up' | 'Stable' | 'Volatile' => {
  const diff = r5 - r10;
  if (Math.abs(diff) >= 3.5) return diff > 0 ? 'Heating Up' : 'Volatile';
  return 'Stable';
};

const recommend = (edge: number, conf: 'High' | 'Medium' | 'Low'): 'Strong Over Look' | 'Lean Over' | 'Pass' | 'Boom/Bust' => {
  if (edge >= 3 && conf === 'High') return 'Strong Over Look';
  if (edge >= 1) return 'Lean Over';
  if (edge <= -2) return 'Pass';
  return 'Boom/Bust';
};

export async function GET() {
  try {
    const fallbackPlayers = playersData as Array<{ name: string; points: number; rebounds: number; assists: number }>;

    const [offers, boxRes] = await Promise.all([
      ODDS_KEY ? fetchOddsPlayerProps(ODDS_KEY) : Promise.resolve([]),
    const [oddsRes, boxRes] = await Promise.allSettled([
      fetch(
        `https://api.the-odds-api.com/v4/sports/basketball_nba/odds?regions=us&markets=player_points,player_rebounds,player_assists,player_threes&oddsFormat=american&apiKey=${ODDS_KEY ?? ''}`,
        { next: { revalidate: 30 } }
      ),
      BALLDONTLIE_KEY
        ? fetch('https://api.balldontlie.io/v1/box_scores/live', {
            headers: { Authorization: BALLDONTLIE_KEY },
            next: { revalidate: 15 }
          })
        : Promise.resolve(new Response(JSON.stringify({ data: [] }), { status: 200 }))
    ]);

    const boxPayload = boxRes.ok ? await boxRes.json() : { data: [] };

    const liveStatByPlayer = new Map<string, { pts: number; reb: number; ast: number; fg3m: number; min: string }>();
    const oddsPayload = oddsRes.status === 'fulfilled' && oddsRes.value.ok ? await oddsRes.value.json() : [];
    const boxPayload = boxRes.status === 'fulfilled' && boxRes.value.ok ? await boxRes.value.json() : { data: [] };

    const liveStatByPlayer = new Map<string, PlayerStat>();
    for (const game of Array.isArray(boxPayload.data) ? boxPayload.data : []) {
      for (const s of Array.isArray(game.stats) ? game.stats : []) {
        const name = `${s.player?.first_name ?? ''} ${s.player?.last_name ?? ''}`.trim();
        if (!name) continue;
        liveStatByPlayer.set(name.toLowerCase(), {
          pts: Number(s.pts ?? 0),
          reb: Number(s.reb ?? 0),
          ast: Number(s.ast ?? 0),
          fg3m: Number(s.fg3m ?? 0),
          min: s.min ?? '26:00'
          id: asNum(s.player?.id),
          first_name: s.player?.first_name ?? '',
          last_name: s.player?.last_name ?? '',
          position: s.player?.position ?? '',
          min: s.min ?? '0:00',
          pts: asNum(s.pts),
          reb: asNum(s.reb),
          ast: asNum(s.ast),
          stl: asNum(s.stl),
          blk: asNum(s.blk),
          fgm: asNum(s.fgm),
          fga: asNum(s.fga),
          fg_pct: asNum(s.fg_pct),
          fg3m: asNum(s.fg3m),
          fg3a: asNum(s.fg3a),
          fg3_pct: asNum(s.fg3_pct),
          ftm: asNum(s.ftm),
          fta: asNum(s.fta),
          ft_pct: asNum(s.ft_pct),
          turnover: asNum(s.turnover),
          pf: asNum(s.pf),
          plus_minus: asNum(s.plus_minus)
        });
      }
    }

    const analyses: PlayerAnalysis[] = [];

    for (const offer of offers) {
      const mk = offer.marketKey;
      const playerName = offer.playerName;
      const line = offer.line;
      const live = liveStatByPlayer.get(playerName.toLowerCase());
      const fallback = fallbackPlayers.find((p) => p.name.toLowerCase() === playerName.toLowerCase());

      const seasonAvg =
        mk === 'player_points'
          ? fallback?.points ?? live?.pts ?? 0
          : mk === 'player_rebounds'
            ? fallback?.rebounds ?? live?.reb ?? 0
            : mk === 'player_assists'
              ? fallback?.assists ?? live?.ast ?? 0
              : live?.fg3m ?? 1.8;

      const currentVal = mk === 'player_points' ? live?.pts ?? 0 : mk === 'player_rebounds' ? live?.reb ?? 0 : mk === 'player_assists' ? live?.ast ?? 0 : live?.fg3m ?? 0;

      const recent5 = seasonAvg * 0.65 + currentVal * 0.35;
      const recent10 = seasonAvg * 0.8 + currentVal * 0.2;
      const minutesConsistency = clamp(parseMin(live?.min ?? '26:00') / 36, 0.35, 1);
      const projected = recent5 * 0.5 + recent10 * 0.2 + seasonAvg * 0.3;
      const edge = projected - line;
      const rawConfidence = Math.abs(edge) * 6 + minutesConsistency * 30;
      const confidence: 'High' | 'Medium' | 'Low' = rawConfidence >= 60 ? 'High' : rawConfidence >= 40 ? 'Medium' : 'Low';
      const trend = scoreTrend(recent5, recent10);
      const recommendation = recommend(edge, confidence);

      analyses.push({
        playerName,
        team: 'N/A',
        opponent: 'N/A',
        game: `${offer.awayTeam} @ ${offer.homeTeam}`,
        gameTime: offer.gameTime,
        marketType: mk === 'player_points' ? 'points' : mk === 'player_rebounds' ? 'rebounds' : mk === 'player_assists' ? 'assists' : 'threes',
        sportsbook: offer.sportsbook,
        line,
        recent5: Number(recent5.toFixed(2)),
        recent10: Number(recent10.toFixed(2)),
        seasonAvg: Number(seasonAvg.toFixed(2)),
        expectedPoints: mk === 'player_points' ? Number(projected.toFixed(2)) : undefined,
        expectedRebounds: mk === 'player_rebounds' ? Number(projected.toFixed(2)) : undefined,
        expectedAssists: mk === 'player_assists' ? Number(projected.toFixed(2)) : undefined,
        expectedThrees: mk === 'player_threes' ? Number(projected.toFixed(2)) : undefined,
        projectedValue: Number(projected.toFixed(2)),
        edge: Number(edge.toFixed(2)),
        confidence,
        trend,
        recommendation,
        boomScore: Number((Math.abs(edge) * (trend === 'Volatile' ? 1.35 : 1)).toFixed(2))
      });
    for (const game of Array.isArray(oddsPayload) ? oddsPayload : []) {
      const home = String(game.home_team ?? 'Home');
      const away = String(game.away_team ?? 'Away');
      const gameTime = String(game.commence_time ?? '');

      for (const bookmaker of Array.isArray(game.bookmakers) ? game.bookmakers : []) {
        const bookTitle = String(bookmaker.title ?? 'Unknown');
        for (const market of Array.isArray(bookmaker.markets) ? bookmaker.markets : []) {
          const mk = String(market.key ?? '');
          if (!['player_points', 'player_rebounds', 'player_assists', 'player_threes'].includes(mk)) continue;

          for (const outcome of Array.isArray(market.outcomes) ? market.outcomes : []) {
            const playerName = String(outcome.description ?? '').trim();
            const line = asNum(outcome.point, NaN);
            if (!playerName || Number.isNaN(line)) continue;

            const live = liveStatByPlayer.get(playerName.toLowerCase());
            const fallback = fallbackPlayers.find((p) => p.name.toLowerCase() === playerName.toLowerCase());
            const seasonAvg =
              mk === 'player_points'
                ? fallback?.points ?? asNum(live?.pts, 0)
                : mk === 'player_rebounds'
                  ? fallback?.rebounds ?? asNum(live?.reb, 0)
                  : mk === 'player_assists'
                    ? fallback?.assists ?? asNum(live?.ast, 0)
                    : asNum(live?.fg3m, 1.8);

            const currentVal =
              mk === 'player_points' ? asNum(live?.pts) : mk === 'player_rebounds' ? asNum(live?.reb) : mk === 'player_assists' ? asNum(live?.ast) : asNum(live?.fg3m);

            const recent5 = seasonAvg * 0.65 + currentVal * 0.35;
            const recent10 = seasonAvg * 0.8 + currentVal * 0.2;
            const minutesConsistency = clamp(parseMin(live?.min ?? '26:00') / 36, 0.35, 1);
            const projected = recent5 * 0.5 + recent10 * 0.2 + seasonAvg * 0.3;
            const edge = projected - line;
            const rawConfidence = Math.abs(edge) * 6 + minutesConsistency * 30;
            const confidence: 'High' | 'Medium' | 'Low' = rawConfidence >= 60 ? 'High' : rawConfidence >= 40 ? 'Medium' : 'Low';
            const trend = scoreTrend(recent5, recent10);
            const recommendation = recommend(edge, confidence);

            analyses.push({
              playerName,
              team: away,
              opponent: home,
              game: `${away} @ ${home}`,
              gameTime,
              marketType:
                mk === 'player_points' ? 'points' : mk === 'player_rebounds' ? 'rebounds' : mk === 'player_assists' ? 'assists' : 'threes',
              sportsbook: bookTitle,
              line,
              recent5: Number(recent5.toFixed(2)),
              recent10: Number(recent10.toFixed(2)),
              seasonAvg: Number(seasonAvg.toFixed(2)),
              expectedPoints: mk === 'player_points' ? Number(projected.toFixed(2)) : undefined,
              expectedRebounds: mk === 'player_rebounds' ? Number(projected.toFixed(2)) : undefined,
              expectedAssists: mk === 'player_assists' ? Number(projected.toFixed(2)) : undefined,
              expectedThrees: mk === 'player_threes' ? Number(projected.toFixed(2)) : undefined,
              projectedValue: Number(projected.toFixed(2)),
              edge: Number(edge.toFixed(2)),
              confidence,
              trend,
              recommendation,
              boomScore: Number((Math.abs(edge) * (trend === 'Volatile' ? 1.35 : 1)).toFixed(2))
            });
          }
        }
      }
    }

    const deduped = Object.values(
      analyses.reduce<Record<string, PlayerAnalysis>>((acc, item) => {
        const k = `${item.playerName}-${item.marketType}`;
        if (!acc[k] || item.edge > acc[k].edge) acc[k] = item;
        return acc;
      }, {})
    );

    const finalPlayers = deduped.length
      ? deduped
      : fallbackPlayers.map((p) => ({
          playerName: p.name,
          team: 'N/A',
          opponent: 'N/A',
          game: 'Today',
          gameTime: '',
          marketType: 'points' as const,
          sportsbook: 'Stat Fallback',
          line: Number((p.points - 1.5).toFixed(1)),
          recent5: p.points,
          recent10: Number((p.points - 1.2).toFixed(2)),
          seasonAvg: p.points,
          expectedPoints: Number((p.points + 1).toFixed(2)),
          projectedValue: Number((p.points + 1).toFixed(2)),
          edge: 2.5,
          confidence: 'Medium' as const,
          trend: 'Stable' as const,
          recommendation: 'Lean Over' as const,
          boomScore: 2.5
        }));

    finalPlayers.sort((a, b) => b.edge - a.edge);

    const byType = (t: PlayerAnalysis['marketType']) => finalPlayers.filter((p) => p.marketType === t).sort((a, b) => b.edge - a.edge)[0];

    const response: PlayerAnalysisResponse = {
      generatedAt: new Date().toISOString(),
      source: deduped.length ? 'odds+stats' : 'stats-fallback',
      summary: {
        bestPointsEdge: byType('points'),
        bestReboundsEdge: byType('rebounds'),
        bestAssistsEdge: byType('assists'),
        bestOverallValue: [...finalPlayers].sort((a, b) => b.edge - a.edge)[0]
      },
      players: finalPlayers
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: 'Failed to build player analysis' }, { status: 500 });
  }
}
