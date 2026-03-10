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
