import { kvGet } from "../_lib.js";

export default async function handler(req, res) {
  const { code } = req.query;
  if (!/^[A-Za-z0-9]{4,12}$/.test(code || ""))
    return res.status(404).send("Not found");

  try {
    const url = await kvGet(`link:${code}`);
    if (!url) return res.status(404).send("Link not found or expired");
    res.redirect(307, url);
  } catch (e) {
    res.status(500).send("Storage error");
  }
}
