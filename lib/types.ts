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

export interface NormalizedLiveGame {
  id: string;
  status: 'scheduled' | 'in' | 'post' | 'pre';
  shortStatus: string;
  startTime: string;
  startTimeET: string;
  period?: number;
  clock?: string;
  broadcast?: string;
  venue?: string;
  homeTeam: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
    score: number;
  };
  awayTeam: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
    score: number;
  };
}

export interface NormalizedOddsGame {
  id: string;
  commenceTime: string;
  homeTeam: string;
  awayTeam: string;
  bookmakers: {
    key: string;
    title: string;
    markets: {
      key: 'h2h' | 'spreads' | 'totals' | string;
      outcomes: {
        name: string;
        price: number;
        point?: number;
      }[];
    }[];
  }[];
}

export interface PlayerLog {
  gameId: number;
  gameDate: string;
  pts: number;
  reb: number;
  ast: number;
}
