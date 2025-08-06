const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  console.log("⏳ Caricamento mappa...");
  await page.goto("http://localhost:8080/mlgmap.html", {
    waitUntil: "networkidle0",
    timeout: 0, // Nessun timeout: la mappa può metterci molto
  });

  console.log("✅ Mappa caricata");

  // Attendi che la mappa sia disponibile
  await page.waitForFunction(() => window.map !== undefined);

  // Zoom simulato per forzare i marker a comparire
  console.log("🔍 Zoom simulato...");
  await page.evaluate(async () => {
    for (let i = 0; i < 3; i++) {
      window.map.zoomOut();
      await new Promise(r => setTimeout(r, 500));
    }
  });

  // Attendi un po' per assicurarsi che tutto sia visibile
  await page.waitForTimeout(1000);

  // Screenshot
  await page.screenshot({ path: "screenshot.png" });
  console.log("📸 Screenshot salvato");

  await browser.close();
})();


