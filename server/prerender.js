const fs = require('fs');
const path = require('path');
const express = require('express');
const puppeteer = require('puppeteer');

const PORT = 3000;
const inputPath = path.join(__dirname, '..', 'mlgmap.html');
const outputDir = path.join(__dirname, '..', 'dist');
const outputPath = path.join(outputDir, 'index.html');

(async () => {
  console.log('🚀 Server avviato');
  const app = express();
  app.use(express.static(path.join(__dirname, '..')));
  const server = app.listen(PORT);

  try {
    console.log('🌀 Avvio browser headless');
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    console.log('⏳ Carico la pagina...');
    await page.goto(`http://localhost:${PORT}/mlgmap.html`, {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    // Attendi che Leaflet abbia caricato almeno una tile
    await page.waitForSelector('.leaflet-tile-loaded', { timeout: 30000 });

    // Attendi anche un po' extra per sicurezza
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('📦 Salvo HTML statico');
    const html = await page.content();

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, html);
    console.log(`✅ HTML salvato in: ${outputPath}`);

    await browser.close();
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Errore nel prerendering:', err);
    server.close();
    process.exit(1);
  }
})();

