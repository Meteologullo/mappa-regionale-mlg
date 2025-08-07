// scripts/export-cache.js
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

(async () => {
  const outDir = path.join(process.cwd(), "data");
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox","--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();

  // Apriamo la tua pagina vera (serve http-server avviato prima)
  const url = "http://localhost:8080/src/mlgmap.html?nocache=1";
  await page.goto(url, { waitUntil: "networkidle2", timeout: 180000 });

  // Aspetta che la pagina carichi i dataset principali.
  // Questi nomi sono quelli del tuo file originale (se sono diversi, dimmelo e li cambio):
  await page.waitForFunction(
    () => window.stazioni && Array.isArray(window.stazioni) && window.stazioni.length > 0,
    { timeout: 180000 }
  ).catch(() => {});

  // Estremi/tabella possono richiedere qualche secondo in più.
  await page.waitForTimeout(8000);

  const dump = await page.evaluate(() => {
    return {
      stazioni:   (typeof window.stazioni !== "undefined") ? window.stazioni : null,
      datiTabella:(typeof window.datiTabella !== "undefined") ? window.datiTabella : null,
      estremi:    (typeof window.extremiGiornalieri !== "undefined") ? window.extremiGiornalieri : null,
      when: new Date().toISOString()
    };
  });

  await browser.close();

  // Salva i json (anche separati se preferisci)
  fs.writeFileSync(path.join(outDir, "stazioni.json"), JSON.stringify(dump.stazioni || [], null, 2));
  fs.writeFileSync(path.join(outDir, "datiTabella.json"), JSON.stringify(dump.datiTabella || [], null, 2));
  fs.writeFileSync(path.join(outDir, "estremi.json"), JSON.stringify(dump.estremi || {}, null, 2));
  fs.writeFileSync(path.join(outDir, "last.json"), JSON.stringify(dump, null, 2));

  console.log("Esportati JSON in:", outDir);
})();
