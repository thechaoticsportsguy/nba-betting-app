export type GameState = 'in' | 'pre' | 'post';

export interface LiveGameTeam {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
  score: number;
}

export interface LiveGame {
  id: string;
  status: string;
  state: GameState;
  period: number;
  clock: string;
  homeTeam: LiveGameTeam;
  awayTeam: LiveGameTeam;
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

export interface LiveBoxScore {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homePlayers: BoxScorePlayer[];
  awayPlayers: BoxScorePlayer[];
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
}

// legacy app types kept for compatibility with existing components/routes
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
