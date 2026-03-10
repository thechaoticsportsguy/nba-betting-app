import { BoxScoreGame, ESPNGame, OddsGame } from '@/lib/types';
import { buildMatchupKey } from '@/lib/teamAliases';

export const getEspnMatchupKey = (game: ESPNGame): string => buildMatchupKey(game.homeTeam.name, game.awayTeam.name);

export const findMatchingBoxScore = (game: ESPNGame, boxGames: BoxScoreGame[]): BoxScoreGame | undefined => {
  const key = getEspnMatchupKey(game);
  return boxGames.find((box) => buildMatchupKey(box.homeTeam.full_name, box.awayTeam.full_name) === key);
};

export const findMatchingOdds = (game: ESPNGame, oddsGames: OddsGame[]): OddsGame | undefined => {
  const key = getEspnMatchupKey(game);
  return oddsGames.find((odds) => buildMatchupKey(odds.homeTeam, odds.awayTeam) === key);
};
