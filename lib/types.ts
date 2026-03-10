/* ── Legacy mock types (kept for /data JSON fallback) ── */
export type GameStatus = 'LIVE' | 'FINAL' | 'UPCOMING';

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  teamLogo: string;
  newsTag: string;
}

export interface Game {
  id: string;
  awayTeamId: string;
  homeTeamId: string;
  awayScore: number;
  homeScore: number;
  quarter: string;
  gameClock: string;
  status: GameStatus;
  featured: boolean;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  playerHeadshot: string;
  points: number;
  rebounds: number;
  assists: number;
}

export interface NewsArticle {
  id: string;
  headline: string;
  description: string;
  teamTag: string;
  articleImage: string;
  publishedAt: string;
}

export interface EnrichedGame extends Game {
  awayTeam: Team;
  homeTeam: Team;
}

export interface EnrichedPlayer extends Player {
  team: Team;
}

/* ── ESPN live scoreboard ── */
export interface ESPNCompetitor {
  id: string;
  team: {
    id: string;
    abbreviation: string;
    displayName: string;
    logo: string;
  };
  score: string;
  homeAway: 'home' | 'away';
  records?: { summary: string }[];
}

export interface ESPNEvent {
  id: string;
  date: string;
  status: {
    type: { state: 'pre' | 'in' | 'post'; shortDetail: string };
    period: number;
    displayClock: string;
  };
  competitions: {
    id: string;
    competitors: ESPNCompetitor[];
    broadcasts?: { names: string[] }[];
  }[];
  shortName: string;
}

export interface LiveGame {
  id: string;
  date: string;
  state: 'pre' | 'in' | 'post';
  shortDetail: string;
  period: number;
  clock: string;
  awayTeam: { id: string; abbr: string; name: string; logo: string; score: number; record?: string };
  homeTeam: { id: string; abbr: string; name: string; logo: string; score: number; record?: string };
  broadcast: string;
}

/* ── BallDontLie ── */
export interface BDLTeam {
  id: number;
  conference: string;
  division: string;
  city: string;
  name: string;
  full_name: string;
  abbreviation: string;
}

export interface BDLPlayer {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  height: string;
  weight: string;
  jersey_number: string;
  college: string;
  country: string;
  draft_year: number | null;
  draft_round: number | null;
  draft_number: number | null;
  team: BDLTeam;
}

export interface BDLSeasonAverages {
  player_id: number;
  season: number;
  games_played: number;
  min: string;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  turnover: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
}

export interface BDLGameStats {
  id: number;
  date: string;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  min: string;
  game: {
    id: number;
    date: string;
    home_team_id: number;
    visitor_team_id: number;
    home_team_score: number;
    visitor_team_score: number;
  };
}

export interface BDLPaginated<T> {
  data: T[];
  meta: { next_cursor: number | null; per_page: number };
}

/* ── Odds API ── */
export interface OddsOutcome {
  name: string;
  price: number;
  point?: number;
}

export interface OddsMarket {
  key: string;
  last_update: string;
  outcomes: OddsOutcome[];
}

export interface OddsBookmaker {
  key: string;
  title: string;
  markets: OddsMarket[];
}

export interface OddsEvent {
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsBookmaker[];
}

export interface NormalizedOddsLine {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  bookmaker: string;
  market: 'h2h' | 'spreads' | 'totals';
  outcomes: OddsOutcome[];
}

/* ── PP Bets ── */
export interface PPBet {
  id: string;
  gameId: string;
  market: string;
  player?: string;
  line: number;
  overOdds: number;
  underOdds: number;
  source: string;
}
