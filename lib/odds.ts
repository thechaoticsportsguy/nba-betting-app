import { BestOddsSummary, BookmakerOdds, MarketOutcome, OddsGame, OddsResponse } from '@/lib/types';

const toOutcome = (o: any): MarketOutcome => ({ name: o.name, price: o.price ?? null, point: o.point ?? null });

const defaultBestOdds = (): BestOddsSummary => ({
  moneyline: { home: null, away: null },
  spread: { home: { point: null, price: null }, away: { point: null, price: null } },
  total: { over: { point: null, price: null }, under: { point: null, price: null } }
});

const pickBestMoneyline = (value: number | null, candidate: number | null): number | null => {
  if (candidate === null) return value;
  if (value === null) return candidate;
  return candidate > value ? candidate : value;
};

export const normalizeOdds = (payload: any): OddsResponse => {
  const games: OddsGame[] = (Array.isArray(payload) ? payload : []).map((game: any) => {
    const bookmakers: BookmakerOdds[] = (game.bookmakers ?? []).map((book: any) => {
      const markets = Array.isArray(book.markets) ? book.markets : [];
      return {
        key: book.key ?? 'unknown',
        title: book.title ?? 'Unknown',
        markets: {
          h2h: (markets.find((m: any) => m.key === 'h2h')?.outcomes ?? []).map(toOutcome),
          spreads: (markets.find((m: any) => m.key === 'spreads')?.outcomes ?? []).map(toOutcome),
          totals: (markets.find((m: any) => m.key === 'totals')?.outcomes ?? []).map(toOutcome)
        }
      };
    });

    const bestOdds = defaultBestOdds();
    for (const book of bookmakers) {
      const h2hHome = book.markets.h2h.find((o) => o.name === game.home_team)?.price ?? null;
      const h2hAway = book.markets.h2h.find((o) => o.name === game.away_team)?.price ?? null;
      bestOdds.moneyline.home = pickBestMoneyline(bestOdds.moneyline.home, h2hHome);
      bestOdds.moneyline.away = pickBestMoneyline(bestOdds.moneyline.away, h2hAway);

      const spreadHome = book.markets.spreads.find((o) => o.name === game.home_team);
      const spreadAway = book.markets.spreads.find((o) => o.name === game.away_team);
      if (spreadHome && (bestOdds.spread.home.point === null || Math.abs(spreadHome.point ?? 0) < Math.abs(bestOdds.spread.home.point ?? 999))) {
        bestOdds.spread.home = { point: spreadHome.point ?? null, price: spreadHome.price ?? null };
      }
      if (spreadAway && (bestOdds.spread.away.point === null || Math.abs(spreadAway.point ?? 0) < Math.abs(bestOdds.spread.away.point ?? 999))) {
        bestOdds.spread.away = { point: spreadAway.point ?? null, price: spreadAway.price ?? null };
      }

      const over = book.markets.totals.find((o) => o.name?.toLowerCase() === 'over');
      const under = book.markets.totals.find((o) => o.name?.toLowerCase() === 'under');
      if (over && (bestOdds.total.over.point === null || (over.point ?? 9999) < (bestOdds.total.over.point ?? 9999))) {
        bestOdds.total.over = { point: over.point ?? null, price: over.price ?? null };
      }
      if (under && (bestOdds.total.under.point === null || (under.point ?? 9999) < (bestOdds.total.under.point ?? 9999))) {
        bestOdds.total.under = { point: under.point ?? null, price: under.price ?? null };
      }
    }

    return {
      gameId: String(game.id ?? ''),
      homeTeam: game.home_team ?? 'Home Team',
      awayTeam: game.away_team ?? 'Away Team',
      bookmakers,
      bestOdds
    };
  });

  return { games };
};
