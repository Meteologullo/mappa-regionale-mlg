const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Naviga alla mappa e aspetta che la rete sia inattiva (nessuna richiesta per 500 ms)
  await page.goto("http://localhost:8080/mlgmap.html", {
    waitUntil: "networkidle2",
    timeout: 0, // Disattiva timeout per evitare errori
  });

  // Aspetta fino a 90 secondi che la mappa venga caricata e assegnata a window.map
  await page.waitForFunction(
    () => typeof window.map !== "undefined",
    { timeout: 90000 } // 90 secondi
  );

  // Zoom out gradualmente per far caricare tutti i marker
  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => window.map.zoomOut());
    await page.waitForTimeout(3000); // Attendi 3 secondi dopo ogni zoom
  }

  // Attendi 10 secondi extra per garantire il rendering completo dei marker
  await page.waitForTimeout(10000);

  // Salva l'HTML risultante
  const content = await page.content();
  fs.writeFileSync("dist/mlgmap.html", content);

  await browser.close();
})();


  return html;
};

