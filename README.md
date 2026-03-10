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
