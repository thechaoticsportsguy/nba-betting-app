export type GameState = 'in' | 'pre' | 'post';

export interface TeamCore {
  id?: string;
  name: string;
  abbreviation: string;
  logo?: string;
  score?: number;
}

export interface ESPNGame {
  id: string;
  espnEventId: string;
  homeTeam: TeamCore;
  awayTeam: TeamCore;
  status: string;
  period: number;
  clock: string;
  startTime: string;
  isLive: boolean;
  state: GameState;
  venue?: string;
  broadcast?: string;
}

export interface PlayerStat {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  min: string;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  fgm: number;
  fga: number;
  fg_pct: number;
  fg3m: number;
  fg3a: number;
  fg3_pct: number;
  ftm: number;
  fta: number;
  ft_pct: number;
  turnover: number;
  pf: number;
  plus_minus: number;
}

export interface BoxScoreTeam {
  abbreviation: string;
  full_name: string;
  players: PlayerStat[];
}

export interface BoxScoreGame {
  gameId: string;
  homeTeam: BoxScoreTeam;
  awayTeam: BoxScoreTeam;
}

export interface LiveBoxScoreResponse {
  games: BoxScoreGame[];
}

export interface MarketOutcome {
  name: string;
  price?: number;
  point?: number;
  description?: string;
}

export interface BookmakerOdds {
  key: string;
  title: string;
  markets: {
    h2h: MarketOutcome[];
    spreads: MarketOutcome[];
    totals: MarketOutcome[];
    player_points?: MarketOutcome[];
    player_rebounds?: MarketOutcome[];
    player_assists?: MarketOutcome[];
    player_threes?: MarketOutcome[];
  };
}

export interface BestOddsSummary {
  moneyline: {
    home: number | null;
    away: number | null;
  };
  spread: {
    home: { point: number | null; price: number | null };
    away: { point: number | null; price: number | null };
  };
  total: {
    over: { point: number | null; price: number | null };
    under: { point: number | null; price: number | null };
  };
}

export interface OddsGame {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  bookmakers: BookmakerOdds[];
  bestOdds: BestOddsSummary;
}

export interface OddsResponse {
  games: OddsGame[];
}


export interface BestOverPlayer {
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
}

export interface BestOverResponse {
  generatedAt: string;
  players: BestOverPlayer[];
  error?: string;
}
export interface PlayerAnalysis {
  playerName: string;
  team: string;
  opponent: string;
  game: string;
  gameTime: string;
  marketType: 'points' | 'rebounds' | 'assists' | 'threes';
  sportsbook: string;
  line: number;
  recent5: number;
  recent10: number;
  seasonAvg: number;
  expectedPoints?: number;
  expectedRebounds?: number;
  expectedAssists?: number;
  expectedThrees?: number;
  projectedValue: number;
  edge: number;
  confidence: 'High' | 'Medium' | 'Low';
  trend: 'Heating Up' | 'Stable' | 'Volatile';
  recommendation: 'Strong Over Look' | 'Lean Over' | 'Pass' | 'Boom/Bust';
  boomScore: number;
}

export interface PlayerAnalysisResponse {
  generatedAt: string;
  source: 'odds+stats' | 'stats-fallback';
  summary: {
    bestPointsEdge?: PlayerAnalysis;
    bestReboundsEdge?: PlayerAnalysis;
    bestAssistsEdge?: PlayerAnalysis;
    bestOverallValue?: PlayerAnalysis;
  };
  players: PlayerAnalysis[];
}

export interface OddsMarketTeam {
  team: string;
  moneyline: number | null;
  spread: number | null;
  total: number | null;
}

export interface GameOdds {
  gameId: string;
  sportsbook: string;
  home: OddsMarketTeam;
  away: OddsMarketTeam;
}

export interface PlayerProfile {
  id: number;
  firstName: string;
  lastName: string;
  team: string;
  position: string;
  height?: string;
  weight?: string;
  jerseyNumber?: string;
  college?: string;
  country?: string;
}

export interface BoxScorePlayer {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  teamAbbreviation: string;
  minutes: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  fgPct: number;
  plusMinus: number;
}

export interface LiveGame extends ESPNGame {}

export interface LiveBoxScore {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homePlayers: BoxScorePlayer[];
  awayPlayers: BoxScorePlayer[];
}

export type MergedGame = {
  id: string;
  matchupKey: string;
  espnEventId: string;
  homeTeam: TeamCore;
  awayTeam: TeamCore;
  status: string;
  period?: number;
  clock?: string;
  startTime?: string;
  isLive: boolean;
  venue?: string;
  broadcast?: string;
  boxScore?: {
    homePlayers: PlayerStat[];
    awayPlayers: PlayerStat[];
  };
  odds?: {
    bookmakers: BookmakerOdds[];
    bestOdds?: BestOddsSummary;
  };
};

// legacy app types kept for compatibility with old mock-data components/routes
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
