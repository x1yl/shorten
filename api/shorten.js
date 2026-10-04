import { kvGet, kvSet } from "./_lib.js";

const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LEN = 6;
const TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const MAX_URL = 500000;

function makeCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LEN));
  let s = "";
  for (const b of bytes) s += ALPHABET[b % ALPHABET.length];
  return s;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "POST only" });

  const { url } = req.body || {};
  if (
    typeof url !== "string" ||
    !/^https?:\/\//i.test(url) ||
    url.length > MAX_URL
  ) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    let code = makeCode();
    for (let i = 0; i < 3; i++) {
      if (!(await kvGet(`link:${code}`))) break;
      code = makeCode();
    }
    await kvSet(`link:${code}`, url, TTL_SECONDS);

    const host = `https://${req.headers.host}`;
    res.status(200).json({
      code,
      short: `${host}/s/${code}`,
      expiresInDays: 30,
    });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
