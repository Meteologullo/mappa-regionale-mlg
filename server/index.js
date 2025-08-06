import express from "express";
import cron    from "node-cron";
import { buildScreenshot } from "./preload.js";

const app = express();
let cache = { img: null };

async function refresh() {
  try {
    cache.img = await buildScreenshot();
    console.log("✅ Screenshot aggiornato", new Date().toLocaleTimeString());
  } catch (err) {
    console.error("❌ Errore prerender:", err.message);
  }
}

refresh();
cron.schedule("*/10 * * * *", refresh);

app.get("/", (_, res) => {
  if (!cache.img) return res.send("<h2>Sto preparando la mappa…</h2>");
  res.send(`<!DOCTYPE html>
<html><body style="margin:0">
  <img src="/map.png" style="width:100vw;height:100vh;object-fit:cover" />
</body></html>`);
});

app.get("/map.png", (_, res) => {
  if (!cache.img) return res.status(503).end();
  res.type("png").send(cache.img);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("🚀 Server in ascolto sulla porta", PORT));
