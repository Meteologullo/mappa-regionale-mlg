const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const app = express();
app.use(express.static(path.join(__dirname, '..')));

const server = app.listen(PORT, () => {
  console.log('🚀 Server avviato');

  // FUNZIONE ASINCRONA CORRETTA
  (async () => {
    try {
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();

      console.log('🌍 Carico la pagina...');
      await page.goto(`http://localhost:${PORT}/mlgmap.html`, {
        waitUntil: 'networkidle2',
        timeout: 180000
      });

      const html = await page.content();

      const outputDir = path.join(__dirname, '..', 'dist');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
      fs.writeFileSync(path.join(outputDir, 'mlgmap.html'), html);

      console.log('✅ Pagina salvata in dist/mlgmap.html');

      await browser.close();
      server.close();
    } catch (error) {
      console.error('❌ Errore nel prerender:', error);
      server.close();
      process.exit(1);
    }
  })(); // CHIUSA LA FUNZIONE IMMEDIATAMENTE INVOCA
});
