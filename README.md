# NBA Live Dashboard (Next.js + TypeScript + Tailwind)

This project provides a unified NBA analytics experience with:

- **Live Games** tab (ESPN live scoreboard)
- **Best Performing Players** tab (odds-driven + stat-backed betting analysis)
- Game drawer with live box score + betting + game info
- Player detail route (`/players/[id]`)
This project uses Next.js App Router and server API routes to render:

- Live games (ESPN scoreboard)
- Clickable game cards
- Right-side live box score panel
- Player stat tables
- Betting markets (moneyline, spread, totals)

## API Routes

- `/api/live-games` → ESPN scoreboard (refresh target: 15s)
- `/api/live-boxscore` → BallDontLie live box scores (refresh target: 10-15s)
- `/api/player/[id]` → BallDontLie player profile
- `/api/odds` → The Odds API markets (refresh target: 30-60s)
- `/api/player-analysis` → merged player prop analysis model
- `/api/best-over` → generate players trending over prop lines
- `/api/live-boxscore` → BallDontLie live box scores (refresh target: 10s)
- `/api/player/[id]` → BallDontLie player profile
- `/api/odds` → The Odds API (refresh target: 30s)

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

Use the **Generate Over-Performers** button in the Best Performing Players tab to fetch `/api/best-over` and render players currently trending over their posted lines.

BALLDONTLIE_API_KEY=5961d28b-ac82-4980-ba1e-de7454c1511a
ODDS_API_KEY=b412e4d9246309c4aac12e3a6bdfee44
```

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
Deploy normally on Vercel. The project is App Router based and uses server API routes compatible with Vercel.
Open `http://localhost:3000`.

## Deployment (Vercel)
1. Push this repo.
2. Import project in Vercel.
3. Add all environment variables from `.env.example`.
4. Deploy.

## Rate limits / caching
- ESPN live games: 20s cache
- Live box scores: 20s cache
- Odds API: 60s cache
- API-SPORTS odds: 30m cache
- Player/team historical endpoints: 10m to 24h cache

All third-party calls go through `app/api/*` routes so no keys are exposed to the client.
