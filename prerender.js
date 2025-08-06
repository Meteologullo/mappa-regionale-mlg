#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const url = 'https://meteologullo.github.io/mappa-regionale-mlg/mlgmap.html';

  // Wait up to 60s for the map to load fully
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

  // Take a full-page screenshot
  const contentHandler = await page.content();

  // Ensure output dir
  const outDir = path.join(__dirname, 'gh-pages');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  // Save prerendered HTML
  fs.writeFileSync(path.join(outDir, 'mlgmap.html'), contentHandler);

  // Also copy any static assets if needed (e.g. CSS/JS)
  // (Assumes your map is self-contained)

  await browser.close();
  console.log('✅ prerender complete');
})();
