// server/index.js
import express from "express";
import cron    from "node-cron";
import { buildHTML } from "./preload.js";

const app = express();
let cache = { html: "<h2>Sto preparando la mappa…</h2>" };

async function refresh() {
  try {
    cache.html = await buildHTML();
    console.log("✅ Mappa rigenerata", new Date().toLocaleTimeString());
  } catch (err) {
    console.error("❌ Errore nel prerender:", err.message);
  }
}

refresh();
cron.schedule("*/10 * * * *", refresh);

app.get("/", (_, res) => res.type("html").send(cache.html));
app.use("/static", express.static("."));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("🚀 Server avviato sulla porta", PORT));
