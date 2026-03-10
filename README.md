# NBA Live Hub

Real-time NBA scores, player stats, and betting lines — built with **Next.js 14** (App Router), **TypeScript**, and **Tailwind CSS**.

## Data Sources

| Source | Endpoint | Auth | Rate Limit |
|--------|----------|------|------------|
| **ESPN** | Scoreboard & game summary (public) | None | Unlimited |
| **BallDontLie** | Players, teams, season averages, game stats | `BALLDONTLIE_API_KEY` | Generous free tier |
| **The Odds API** | Moneyline, spread, totals from US bookmakers | `ODDS_API_KEY` | ~500 req/month free |
| **API-SPORTS** | Supplementary NBA odds & player props | `APISPORTS_KEY` | 100 req/day free |
| **PP API** | Proprietary player props / betting lines | `PP_API_KEY` + `PP_API_URL` | Varies |

All external calls run through **Next.js API routes** (`app/api/`) — API keys are never exposed to the client.

## Pages

- **`/`** — Live scoreboard (ESPN) with auto-refresh every 30 seconds. Odds ticker at the top.
- **`/games/[gameId]`** — Game detail with box score and betting lines.
- **`/players/[playerId]`** — Player profile, season averages, recent performance chart (recharts), and game log.
- **`/teams`** — All 30 NBA teams. Click through for roster with links to player pages.
- **`/teams/[teamId]`** — Team detail page with roster.
- **`/betting`** — Consolidated betting dashboard with filters for bookmaker, market, and odds format toggle (American / Decimal).

## Caching Strategy

- ESPN scoreboard: 30 s revalidation + in-memory cache
- BallDontLie: 10 min in-memory cache
- Odds API: 5 min (protects the ~500/month free quota)
- API-SPORTS: 15 min (protects the 100/day free limit)
- PP API: 5 min
- Teams list: 24 h

## Getting Started

```bash
# Install dependencies
npm install

# Copy env vars and fill in your keys
cp .env.example .env

# Run locally
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub.
2. Import the repo in Vercel.
3. Set environment variables in the Vercel dashboard (see `.env.example`).
4. Deploy — Vercel auto-detects Next.js.

## Environment Variables

```
BALLDONTLIE_API_KEY   – BallDontLie API key
ODDS_API_KEY          – The Odds API key
APISPORTS_KEY         – API-SPORTS / RapidAPI key
PP_API_KEY            – Proprietary PP API bearer token
PP_API_URL            – Proprietary PP API base URL
```

All variables are **optional** — the app gracefully degrades if a key is missing, showing placeholder messages instead.

## Tech Stack

- Next.js 14 (App Router, React Server Components)
- TypeScript (strict)
- Tailwind CSS
- recharts (player performance charts)
- clsx (conditional classnames)
