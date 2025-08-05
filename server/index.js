import express from "express";
import cron    from "node-cron";
import { buildHTML } from "./preload.js";

const app = express();
let cache = { html: "<h2>Sto preparando la mappa…</h2>" };

async function refresh() {
  cache.html = await buildHTML();
  console.log("✅ Mappa rigenerata", new Date().toLocaleTimeString());
}
refresh();                      // subito
cron.schedule("*/10 * * * *", refresh);  // poi ogni 10'

app.get("/", (_, res) => res.type("html").send(cache.html));
app.use("/static", express.static(".")); // serve icone/css se ce ne sono
app.listen(process.env.PORT || 8080);
