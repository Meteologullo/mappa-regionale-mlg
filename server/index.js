import express from "express";
import cron    from "node-cron";
import { buildHTML } from "./preload.js";

const app = express();

// conterrà sempre l’ultima versione “calda” della pagina
let cache = { html: "<h2>Sto preparando la mappa…</h2>" };

// Rigenera la mappa; se va in errore non fa crollare il server
async function refresh() {
  try {
    cache.html = await buildHTML();
    console.log("✅ Mappa rigenerata", new Date().toLocaleTimeString());
  } catch (err) {
    console.error("❌ Errore nel prerender:", err.message);
  }
}

// 1) prima rigenerazione subito               //
// 2) poi ogni 10 minuti (cron: "*/10 * * * *")//
refresh();
cron.schedule("*/10 * * * *", refresh);

// endpoint principale
app.get("/", (_, res) => res.type("html").send(cache.html));

// espone eventuali risorse locali (icone, css…)
app.use("/static", express.static("."));

// Railway inserisce PORT; in locale userà 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("🚀 Server avviato sulla porta", PORT));
