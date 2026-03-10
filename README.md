# NBA Live Dashboard (Next.js + TypeScript + Tailwind)

This project uses Next.js App Router and server API routes to render:

- Live games (ESPN scoreboard)
- Clickable game cards
- Right-side live box score panel
- Player stat tables
- Betting markets (moneyline, spread, totals)

## API Routes

- `/api/live-games` → ESPN scoreboard (refresh target: 15s)
- `/api/live-boxscore` → BallDontLie live box scores (refresh target: 10s)
- `/api/player/[id]` → BallDontLie player profile
- `/api/odds` → The Odds API (refresh target: 30s)

## Environment Variables

Create `.env.local`:

```bash
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
