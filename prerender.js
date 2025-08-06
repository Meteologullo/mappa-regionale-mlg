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

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });

  const contentHandler = await page.content();

  const outDir = path.join(__dirname, 'gh-pages');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  fs.writeFileSync(path.join(outDir, 'mlgmap.html'), contentHandler);

  await browser.close();
  console.log("✅ prerender complete");
})();
