# KZ Links — Vercel link shortener

Short-link service (built for long `#d=…` share links). The fragment never
leaves the browser, so the server only ever sees the short code — share data
stays private.

## Stack

- Vercel Serverless Functions (`api/`)
- **Upstash Redis** (via Vercel Marketplace) for storage, 30-day TTL
- **Zero dependencies** — `api/_lib.js` is a ~25-line REST client, no npm install needed
- No build step. `public/index.html` is the UI.

## Setup storage (Vercel KV was sunset — use Marketplace Upstash)

1. Vercel Dashboard → **Storage → Marketplace** → find **Upstash** →
   **Redis** → Create → it auto-provisions an account with unified billing
2. **Connect to project** — it sets `UPSTASH_REDIS_REST_URL` and
   `UPSTASH_REDIS_REST_TOKEN` on your project
3. **Redeploy** (Deployments → ⋯ → Redeem/Redeploy)

No Marketplace? A plain free account at upstash.com works too — create a
Redis database, copy its REST URL + token into the same env var names.

## Deploy

```bash
cd link-shortener
vercel          # preview
vercel --prod
```

(There are no dependencies, so there is nothing to install.)

## Endpoints

| Route          | Method | Body           | Returns                          |
| -------------- | ------ | -------------- | -------------------------------- |
| `/api/shorten` | POST   | `{ "url": … }` | `{ code, short, expiresInDays }` |
| `/s/:code`     | GET    | —              | 307 redirect to the long URL     |

CORS is open (`*`) so the college tracker can call `/api/shorten` cross-origin.

## Use from the college tracker

Point `share()` at this service:

```js
const r = await fetch("https://links.kevinzheng.fyi/api/shorten", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: location.href }),
});
const j = await r.json();
// copy j.short; fall back to the long URL if the request fails
```
