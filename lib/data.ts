import games from '@/data/games.json';
import news from '@/data/news.json';
import players from '@/data/players.json';
import teams from '@/data/teams.json';
import { EnrichedGame, EnrichedPlayer, Game, NewsArticle, Player, Team } from '@/lib/types';

const typedTeams = teams as Team[];
const typedGames = games as Game[];
const typedPlayers = players as Player[];
const typedNews = news as NewsArticle[];

export const getTeams = async (): Promise<Team[]> => typedTeams;

export const getGames = async (): Promise<Game[]> => typedGames;

export const getPlayers = async (): Promise<Player[]> => typedPlayers;

export const getNews = async (): Promise<NewsArticle[]> => typedNews;
import gamesData from '@/data/games.json';
import newsData from '@/data/news.json';
import playersData from '@/data/players.json';
import teamsData from '@/data/teams.json';
import { EnrichedGame, EnrichedPlayer, Game, NewsArticle, Player, Team } from '@/lib/types';

const teams = teamsData as Team[];
const games = gamesData as Game[];
const players = playersData as Player[];
const news = newsData as NewsArticle[];

export const getTeams = async (): Promise<Team[]> => teams;
export const getGames = async (): Promise<Game[]> => games;
export const getPlayers = async (): Promise<Player[]> => players;
export const getNews = async (): Promise<NewsArticle[]> => news;

export const getEnrichedGames = async (): Promise<EnrichedGame[]> => {
  const [allGames, allTeams] = await Promise.all([getGames(), getTeams()]);

  return allGames
    .map((game) => {
      const awayTeam = allTeams.find((team) => team.id === game.awayTeamId);
      const homeTeam = allTeams.find((team) => team.id === game.homeTeamId);
      if (!awayTeam || !homeTeam) {
        return null;
      }
      if (!awayTeam || !homeTeam) return null;
      return { ...game, awayTeam, homeTeam };
    })
    .filter((game): game is EnrichedGame => game !== null);
};

export const getEnrichedPlayers = async (): Promise<EnrichedPlayer[]> => {
  const [allPlayers, allTeams] = await Promise.all([getPlayers(), getTeams()]);

  return allPlayers
    .map((player) => {
      const team = allTeams.find((t) => t.id === player.teamId);
      if (!team) {
        return null;
      }
      if (!team) return null;
      return { ...player, team };
    })
    .filter((player): player is EnrichedPlayer => player !== null);
};
