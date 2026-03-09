# AGENTS.md

## Project overview

shrty.dev is a URL shortening service built on the Cloudflare Developer Platform. It runs as a Cloudflare Worker using Hono as the web framework.

## Architecture

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Config**: `wrangler.jsonc`
- **Entry point**: `src/index.ts`
- **Static assets**: `public/` (served via Workers Assets)

## Key bindings

- `URLS` — KV namespace storing slug-to-URL mappings
- `TRACKER` — Analytics Engine dataset (`link_clicks`) recording click events with geo metadata
- `AI` — Workers AI binding, currently using `@cf/zai-org/glm-4.7-flash`

## Routes

- `GET /:slug` — Redirects to the stored URL, logs click to Analytics Engine
- `POST /api/url` — Creates a shorty (JWT-protected)
- `POST /api/report/:slug` — Returns click-by-country report for a slug (JWT-protected)
- `GET /admin/api/analytics` — Returns 3-month click summary grouped by slug
- `POST /admin/chat` — AI chat endpoint with tool calling (create shorties, query analytics)
- `POST /tmp/token` — Generates a signed JWT

## Admin UI

- `/admin/` — Chat interface for managing shorties via natural language
- `/admin/analytics.html` — Analytics dashboard showing click counts per slug

## Environment variables

See `.dev.vars.example` for required secrets:
- `CLOUDFLARE_ACCOUNT_ID` — Account ID for Analytics Engine SQL API
- `CLOUDFLARE_API_TOKEN` — API token with Analytics Engine read access
- `JWT_SECRET` — Secret for signing/verifying JWT tokens on `/api/*` routes

## Development

```bash
npm install
npm run dev
```

## Deployment

```bash
npm run deploy
```

## Code style

- TypeScript, no semicolons are fine (existing code uses them)
- Hono route handlers in `src/index.ts`
- Static HTML/JS/CSS in `public/` — retro pixel aesthetic using "Press Start 2P" font
