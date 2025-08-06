const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  console.log("⏳ Caricamento mappa...");
  await page.goto("http://localhost:8080/mlgmap.html", {
    waitUntil: "networkidle0",
    timeout: 0
  });

  console.log("✅ Mappa caricata");

  // Aspetta che la mappa sia disponibile
  await page.waitForFunction(() => window.map !== undefined);

  // Zoom simulato per far apparire tutti i marker
  console.log("🔍 Zoom simulato...");
  await page.evaluate(async () => {
    for (let i = 0; i < 3; i++) {
      window.map.zoomOut();
      await new Promise(r => setTimeout(r, 500));
    }
  });

  // Attendi che i marker vengano ridisegnati
  await page.waitForTimeout(5000);

  // Salva l'HTML completo della mappa nello stato finale
  const content = await page.content();
  fs.writeFileSync("dist/mlgmap.html", content);

  console.log("📄 HTML salvato con successo");

  await browser.close();
})();


