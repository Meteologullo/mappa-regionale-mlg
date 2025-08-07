const fs = require('fs');
const path = require('path');
const express = require('express');
const puppeteer = require('puppeteer');

const PORT = 3000;
const inputPath = path.join(__dirname, '..', 'mlgmap.html');
const outputDir = path.join(__dirname, '..', 'dist');
const outputPath = path.join(outputDir, 'index.html');

(async () => {
  console.log('🚀 Avvio server statico...');
  const app = express();
  app.use(express.static(path.join(__dirname, '..')));
  const server = app.listen(PORT);

  try {
    console.log('🌀 Avvio browser headless...');
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    console.log('⏳ Apro pagina mlgmap...');
    await page.goto(`http://localhost:${PORT}/mlgmap.html`, {
      waitUntil: 'networkidle2',
      timeout: 180000 // 3 minuti
    });

    console.log('⌛ Attesa extra 5 secondi per sicurezza...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const html = await page.content();

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, html);
    console.log(`✅ HTML statico salvato in: ${outputPath}`);

    await browser.close();
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Errore nel prerendering:', err);
    server.close();
    process.exit(1);
  }
})();
