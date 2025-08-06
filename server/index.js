const express = require("express");
const cron = require("node-cron");
const { buildHTML } = require("./preload.js");

const app = express();
let cache = { html: "<h2>Sto preparando la mappa…</h2>" };

async function refresh() {
  try {
    cache.html = await buildHTML();
    console.log("✅ HTML prerenderizzato", new Date().toLocaleTimeString());
  } catch (err) {
    console.error("❌ Errore prerender:", err.message);
  }
}

refresh();
cron.schedule("*/10 * * * *", refresh);

app.get("/", (_, res) => res.type("html").send(cache.html));
app.use("/static", express.static("."));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("🚀 Server in ascolto sulla porta", PORT));

