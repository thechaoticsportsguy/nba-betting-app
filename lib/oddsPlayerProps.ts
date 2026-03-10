export type PlayerPropOffer = {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: string;
  sportsbook: string;
  marketKey: 'player_points' | 'player_rebounds' | 'player_assists' | 'player_threes';
  playerName: string;
  line: number;
  price: number | null;
};

const PLAYER_MARKETS = ['player_points', 'player_rebounds', 'player_assists', 'player_threes'] as const;

export async function fetchOddsPlayerProps(apiKey: string): Promise<PlayerPropOffer[]> {
  const base = 'https://api.the-odds-api.com/v4/sports/basketball_nba';

  const eventsRes = await fetch(`${base}/events?apiKey=${apiKey}`, { next: { revalidate: 300 } });
  if (!eventsRes.ok) {
    return [];
  }
  const events = await eventsRes.json();
  const list = Array.isArray(events) ? events.slice(0, 8) : [];

  const offers: PlayerPropOffer[] = [];

  for (const event of list) {
    const eventId = String(event?.id ?? '');
    if (!eventId) continue;

    const oddsUrl = new URL(`${base}/events/${eventId}/odds`);
    oddsUrl.searchParams.set('apiKey', apiKey);
    oddsUrl.searchParams.set('regions', 'us');
    oddsUrl.searchParams.set('markets', PLAYER_MARKETS.join(','));
    oddsUrl.searchParams.set('oddsFormat', 'american');

    const oddsRes = await fetch(oddsUrl.toString(), { next: { revalidate: 30 } });
    if (!oddsRes.ok) continue;

    const payload = await oddsRes.json();
    const homeTeam = String(payload?.home_team ?? event?.home_team ?? 'Home');
    const awayTeam = String(payload?.away_team ?? event?.away_team ?? 'Away');
    const gameTime = String(payload?.commence_time ?? event?.commence_time ?? '');

    for (const book of Array.isArray(payload?.bookmakers) ? payload.bookmakers : []) {
      const sportsbook = String(book?.title ?? 'Unknown');
      for (const market of Array.isArray(book?.markets) ? book.markets : []) {
        const marketKey = String(market?.key ?? '');
        if (!PLAYER_MARKETS.some((m) => m === marketKey)) continue;

        for (const outcome of Array.isArray(market?.outcomes) ? market.outcomes : []) {
          const playerName = String(outcome?.description ?? '').trim();
          const line = Number(outcome?.point ?? NaN);
          if (!playerName || Number.isNaN(line)) continue;

          offers.push({
            gameId: eventId,
            homeTeam,
            awayTeam,
            gameTime,
            sportsbook,
            marketKey: marketKey as PlayerPropOffer['marketKey'],
            playerName,
            line,
            price: typeof outcome?.price === 'number' ? outcome.price : null
          });
        }
      }
    }
  }

  return offers;
}
