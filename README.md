# NBA Live Hub (Next.js + TypeScript)

A Vercel-deployable Next.js App Router project that renders:

- Live NBA games
- Team logos
- Player headshots
- Current score, quarter, game clock
- Team news headlines
- Featured game section

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- API routes (`/app/api/*`)
- React Server Components + client refresh hook

## Run locally

```bash
npm install
npm run dev
```

Build test:

```bash
npm run build
```

## Real-time refresh strategy

`hooks/useLiveGames.ts` polls `/api/games` every 10 seconds to keep the live games grid updated.

## Mock data location

- `data/games.json`
- `data/teams.json`
- `data/players.json`
- `data/news.json`

## Replace mock data with real NBA APIs later

1. Add server-side API keys to `.env.local`:
   - `NBA_API_KEY=...`
   - `NBA_NEWS_API_KEY=...`
2. Update `lib/data.ts` to fetch from external providers instead of local JSON.
3. Keep component interfaces unchanged (`lib/types.ts`) so UI does not need refactor.
4. Add response mapping from provider payloads to local types (`Game`, `Team`, `Player`, `NewsArticle`).
5. Keep `/app/api/*` routes as your server abstraction boundary for frontend stability.

## Vercel deployment

Push to GitHub and connect the repo in Vercel. Every merge to your production branch triggers:

GitHub PR merge → Vercel build (`npm run build`) → redeploy.
