// prerender.js
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const url = 'https://meteologullo.github.io/mappa-regionale-mlg/mlgmap.html';
  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // imposta viewport
    await page.setViewport({ width: 1280, height: 800 });

    // blocca immagini, font e css per velocizzare
    await page.setRequestInterception(true);
    page.on('request', req => {
      const t = req.resourceType();
      if (['image','stylesheet','font'].includes(t)) req.abort();
      else req.continue();
    });

    // naviga e aspetta che il network sia idle
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });

    // prendi l'HTML renderizzato
    const html = await page.content();

    // scrivi in gh-pages/index.html
    const outDir = path.join(__dirname, 'gh-pages');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
    fs.writeFileSync(path.join(outDir, 'index.html'), html);

    console.log('✅ prerender completato');
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();

