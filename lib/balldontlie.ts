import { BoxScoreGame, LiveBoxScoreResponse, PlayerProfile, PlayerStat } from '@/lib/types';

const toStat = (entry: any): PlayerStat => ({
  id: Number(entry.player?.id ?? 0),
  first_name: entry.player?.first_name ?? '',
  last_name: entry.player?.last_name ?? '',
  position: entry.player?.position ?? '',
  min: entry.min ?? '0',
  pts: Number(entry.pts ?? 0),
  reb: Number(entry.reb ?? 0),
  ast: Number(entry.ast ?? 0),
  stl: Number(entry.stl ?? 0),
  blk: Number(entry.blk ?? 0),
  fgm: Number(entry.fgm ?? 0),
  fga: Number(entry.fga ?? 0),
  fg_pct: Number(entry.fg_pct ?? 0),
  fg3m: Number(entry.fg3m ?? 0),
  fg3a: Number(entry.fg3a ?? 0),
  fg3_pct: Number(entry.fg3_pct ?? 0),
  ftm: Number(entry.ftm ?? 0),
  fta: Number(entry.fta ?? 0),
  ft_pct: Number(entry.ft_pct ?? 0),
  turnover: Number(entry.turnover ?? 0),
  pf: Number(entry.pf ?? 0),
  plus_minus: Number(entry.plus_minus ?? 0)
});

const byGameImportance = (a: PlayerStat, b: PlayerStat) => b.min.localeCompare(a.min) || b.pts - a.pts;

export const normalizeLiveBoxScores = (payload: any): LiveBoxScoreResponse => {
  const games = (Array.isArray(payload?.data) ? payload.data : []).map((item: any) => {
    const stats = Array.isArray(item.stats) ? item.stats : [];
    const homeId = Number(item.game?.home_team_id ?? 0);
    const awayId = Number(item.game?.visitor_team_id ?? 0);

    const homePlayers = stats
      .filter((s: any) => Number(s.team?.id) === homeId)
      .map(toStat)
      .sort(byGameImportance);
    const awayPlayers = stats
      .filter((s: any) => Number(s.team?.id) === awayId)
      .map(toStat)
      .sort(byGameImportance);

    return {
      gameId: String(item.game?.id ?? ''),
      homeTeam: {
        abbreviation: item.game?.home_team?.abbreviation ?? 'HOME',
        full_name: item.game?.home_team?.full_name ?? 'Home Team',
        players: homePlayers
      },
      awayTeam: {
        abbreviation: item.game?.visitor_team?.abbreviation ?? 'AWAY',
        full_name: item.game?.visitor_team?.full_name ?? 'Away Team',
        players: awayPlayers
      }
    } satisfies BoxScoreGame;
  });

  return { games };
};

export const normalizePlayerProfile = (payload: any): PlayerProfile => {
  const p = payload?.data ?? payload ?? {};
  return {
    id: Number(p.id ?? 0),
    firstName: p.first_name ?? '',
    lastName: p.last_name ?? '',
    team: p.team?.full_name ?? '',
    position: p.position ?? '',
    height: p.height,
    weight: p.weight,
    jerseyNumber: p.jersey_number,
    college: p.college,
    country: p.country
  };
};
