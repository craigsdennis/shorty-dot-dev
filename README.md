# shrty.dev

A #BuildInPublic URL shortening service built on the [Cloudflare Developer Platform](https://developers.cloudflare.com).

## What it uses

- [Workers](https://developers.cloudflare.com/workers/) — Runtime
- [Hono](https://hono.dev/) — Web framework
- [KV](https://developers.cloudflare.com/kv/) — Stores slug-to-URL mappings
- [Workers Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/) — Tracks and reports on click events with geo metadata
- [Workers AI](https://developers.cloudflare.com/workers-ai/) — Powers the admin chat interface (`@cf/zai-org/glm-4.7-flash`) with tool calling

## Admin

- `/admin/` — Chat interface for managing shorties via natural language (create links, query analytics)
- `/admin/analytics.html` — Dashboard showing click counts per slug over the past 3 months

## Resources

[![Watch shrty.dev Admin AI on YouTube](https://img.youtube.com/vi/MlV9Kvkh9hw/0.jpg)](https://youtu.be/MlV9Kvkh9hw)

## Setup your own

### Prerequisites

Create a KV namespace for URL storage:

```bash
npx wrangler kv namespace create URLS
```

Update the `kv_namespaces` id in `wrangler.jsonc` with the returned namespace ID.

Create a [Workers Analytics Engine API token](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/) with read access.

Copy `.dev.vars.example` to `.dev.vars` and fill in the values:

```bash
cp .dev.vars.example .dev.vars
```

Generate types:

```bash
npm run cf-typegen
```

### Development

```bash
npm install
npm run dev
```

### Deployment

```bash
npm run deploy
```
