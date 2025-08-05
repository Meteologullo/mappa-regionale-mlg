import express from "express";
import cron    from "node-cron";
import { buildHTML } from "./preload.js";

const app = express();

/* Contiene l'ultima versione "calda" della pagina */
let cache = { html: "<h2>Sto preparando la mappa…</h2>" };

/* Funzione che rigenera la cache */
async function refresh() {
  cache.html = await buildHTML();
  console.log("✅ Mappa rigenerata", new Date().toLocaleTimeString());
}

/* 1) subito all'avvio  2) poi ogni 10 minuti (*/10 *) */
refresh();
cron.schedule("*/10 * * * *", refresh);

/* Endpoint principale */
app.get("/", (_, res) => res.type("html").send(cache.html));

/* Espone eventuali immagini / css che la tua pagina usa relativi al repo */
app.use("/static", express.static("."));

/* Railway fornisce PORT, in locale default 8080 */
app.listen(process.env.PORT || 8080);
