# NBA Betting App (Next.js 14)

Live NBA dashboard with scores, box scores, stats, and betting lines.

## APIs integrated
- ESPN scoreboard + summary (no key)
- BallDontLie v2 (`BALDONTLIE_API_KEY`) for players/teams/games
- BallDontLie live + player details (`BALLS_API_KEY`) for live box scores and bios
- The Odds API (`ODDS_API_KEY`) for moneyline/spread/total
- API-SPORTS (`APISPORTS_KEY`) for supplementary odds/props
- Proprietary PP API (`PP_API_KEY`, `PP_API_URL`) for props

## Required env vars
Copy `.env.example` to `.env.local` and fill values.

## Local development
```bash
npm install
npm run dev
```
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
