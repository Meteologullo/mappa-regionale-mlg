const express = require("express");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 8080;

app.use(express.static("."));

const server = app.listen(PORT, async () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(`http://localhost:${PORT}/mlgmap.html`, {
      waitUntil: "networkidle0",
      timeout: 0,
    });

    const content = await page.content();

    if (!fs.existsSync("dist")) fs.mkdirSync("dist");
    fs.writeFileSync(path.join("dist", "index.html"), content); // output mappa
    fs.copyFileSync("start.html", path.join("dist", "start.html")); // redirect page

    await browser.close();
    console.log("✅ Prerender completato");

    server.close(() => {
      console.log("🔒 Server chiuso.");
      process.exit(0);
    });
  } catch (err) {
    console.error("❌ Errore nel prerender:", err);
    server.close(() => process.exit(1));
  }
});

