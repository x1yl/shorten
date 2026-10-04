// Minimal Upstash Redis REST client.
// Works with a Vercel Marketplace Upstash store (UPSTASH_REDIS_REST_*)
// or a plain Upstash account. Underscore prefix keeps Vercel from
// treating this file as a route.
const BASE =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
const TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";

async function cmd(...args) {
  if (!BASE || !TOKEN) throw new Error("Redis env vars not configured");
  const r = await fetch(BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  if (!r.ok) throw new Error("Redis request failed: " + r.status);
  const j = await r.json();
  if (j.error) throw new Error("Redis error: " + j.error);
  return j.result;
}

export const kvGet = (key) => cmd("GET", key);
export const kvSet = (key, value, exSeconds) =>
  cmd("SET", key, value, "EX", exSeconds);
