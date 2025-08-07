#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const url = 'http://localhost:8080/mlgmap.html';

  // Carica la mappa
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });

  // ✅ Esegui uno zoom per forzare il caricamento di marker "nascosti"
  await page.evaluate(() => {
    // ⚠️ Assumiamo che la mappa sia accessibile come `window.map`
    const map = window.map;
    if (map && typeof map.setZoom === "function") {
      map.setZoom(10); // Cambia il livello se necessario
    }
  });

  // Aspetta che i nuovi marker vengano renderizzati
  await page.waitForTimeout(3000);

  // Prendi il contenuto HTML completo
  const html = await page.content();

  // Scrivi l'output in dist/index.html
  const outputPath = path.join('dist', 'index.html');
  fs.writeFileSync(outputPath, html);

  // Chiudi il browser
  await browser.close();
})();
