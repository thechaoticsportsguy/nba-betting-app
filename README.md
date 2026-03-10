# NBA Live Dashboard (Next.js + TypeScript + Tailwind)

This project provides a unified NBA analytics experience with:

- **Live Games** tab (ESPN live scoreboard)
- **Best Performing Players** tab (odds-driven + stat-backed betting analysis)
- Game drawer with live box score + betting + game info
- Player detail route (`/players/[id]`)

## API Routes

- `/api/live-games` → ESPN scoreboard (refresh target: 15s)
- `/api/live-boxscore` → BallDontLie live box scores (refresh target: 10-15s)
- `/api/player/[id]` → BallDontLie player profile
- `/api/odds` → The Odds API markets (refresh target: 30-60s)
- `/api/player-analysis` → merged player prop analysis model

## Environment Variables

Create `.env.local`:

```bash
BALLDONTLIE_API_KEY=
ODDS_API_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Analysis model (first-pass)

`/api/player-analysis` combines The Odds API prop lines + available live stats/fallback stats and computes:

- `recent5`, `recent10`, `seasonAvg`
- projected output (`projectedValue` / expected stat)
- `edge = projected - line`
- confidence (`High` / `Medium` / `Low`) from edge magnitude + minutes consistency
- trend (`Heating Up` / `Stable` / `Volatile`) from recent form slope
- recommendation (`Strong Over Look` / `Lean Over` / `Pass` / `Boom/Bust`)

If player props are not available, the route gracefully returns stat-based fallback cards.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Vercel

Deploy normally on Vercel. API keys should be configured in Vercel project environment variables.
