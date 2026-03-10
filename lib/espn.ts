import { ESPNGame, GameState } from '@/lib/types';

export const normalizeEspnGames = (payload: any): ESPNGame[] => {
  const events = Array.isArray(payload?.events) ? payload.events : [];
  return events.map((event: any) => {
    const competition = event.competitions?.[0];
    const competitors = competition?.competitors ?? [];
    const home = competitors.find((c: any) => c.homeAway === 'home');
    const away = competitors.find((c: any) => c.homeAway === 'away');
    const broadcasts = competition?.broadcasts ?? [];

    const state = (competition?.status?.type?.state ?? 'pre') as GameState;

    return {
      id: String(event.id),
      espnEventId: String(event.id),
      homeTeam: {
        id: String(home?.team?.id ?? ''),
        name: home?.team?.displayName ?? 'Home Team',
        abbreviation: home?.team?.abbreviation ?? 'HOME',
        logo: home?.team?.logo,
        score: Number(home?.score ?? 0)
      },
      awayTeam: {
        id: String(away?.team?.id ?? ''),
        name: away?.team?.displayName ?? 'Away Team',
        abbreviation: away?.team?.abbreviation ?? 'AWAY',
        logo: away?.team?.logo,
        score: Number(away?.score ?? 0)
      },
      status: competition?.status?.type?.shortDetail ?? competition?.status?.type?.description ?? 'Scheduled',
      period: Number(competition?.status?.period ?? 0),
      clock: competition?.status?.displayClock ?? '',
      startTime: event?.date ?? competition?.date ?? '',
      isLive: state === 'in',
      state,
      venue: competition?.venue?.fullName,
      broadcast: broadcasts[0]?.names?.[0]
    } satisfies ESPNGame;
  });
};
