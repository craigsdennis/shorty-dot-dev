# shrty.dev

This is a #BuildInPublic project of a URL Shortening service built on the [Cloudflare Developer Platform](https://developers.cloudflare.com).

It makes use of the Key Value service [KV](https://developers.cloudflare.com/kv) to store the shorty and the URL.

It also uses the [Workers Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/) to track and report on usage.

## Setup your own

### Setup

Build a new KV service for yourself to track the URLs

```bash
npx wrangler kv:namespace create URLS
```

Replace wrangler.toml settings for the KV section

Create a new [Workers Analytics Engine API token](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/)

Copy the [.dev.vars.example](./.dev.vars.example) to `.dev.vars` (for local development)

Regenerate types

```bash
npx wrangler cf-typegen
```

## Develop

```bash
npm run dev
```

## Deploy

```bash
npm run deploy
```


