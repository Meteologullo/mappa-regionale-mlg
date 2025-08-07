const express   = require('express');
const path      = require('path');
const fs        = require('fs');
const puppeteer = require('puppeteer');
const { setTimeout: delay } = require('timers/promises');

(async () => {
  const ROOT = path.join(__dirname, '..');
  const DIST = path.join(ROOT, 'dist');
  const OUT  = path.join(DIST, 'mlgmap.html');
  const PORT = 8080;

  const app = express();
  app.use(express.static(ROOT));
  const server = app.listen(PORT, () =>
    console.log(`🌐  Server locale su http://localhost:${PORT}`)
  );

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    console.log('🗺️  Carico mlgmap.html…');

    await page.goto(`http://localhost:${PORT}/mlgmap.html`, {
      waitUntil: 'networkidle2',
      timeout: 180_000
    });

    await delay(500);          // piccola attesa

    const html = await page.content();
    fs.mkdirSync(DIST, { recursive: true });
    fs.writeFileSync(OUT, html);
    console.log(`✅  Pagina renderizzata in ${OUT}`);

    await browser.close();
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('❌  Prerender fallito:', err);
    server.close();
    process.exit(1);
  }
})();
