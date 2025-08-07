// scripts/export-cache.js
// Genera dist/index.html pre-renderizzato della tua /src/mlgmap.html

const http = require('http');
const path = require('path');
const fs = require('fs');
const finalhandler = require('finalhandler');
const serveStatic = require('serve-static');
const puppeteer = require('puppeteer');

const PORT = process.env.PORT || 8080;
const serve = serveStatic('.', { index: ['index.html'] });

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => serve(req, res, finalhandler(req, res)));
    server.listen(PORT, () => resolve(server));
  });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const server = await startServer();

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Apri il sorgente locale (non la Pages) così usa i file del repo
  const url = `http://localhost:${PORT}/src/mlgmap.html`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });

  // Aspetta che i marker Leaflet compaiano (Leaflet -> .leaflet-marker-icon)
  await page.waitForFunction(
    () => document.querySelectorAll('.leaflet-marker-icon').length > 20,
    { timeout: 120000 }
  );

  // piccolo extra per far “assestare” la UI
  await sleep(1500);

  const html = await page.content();

  fs.mkdirSync('dist', { recursive: true });
  fs.writeFileSync(path.join('dist', 'index.html'), html, 'utf8');

  await browser.close();
  server.close();

  console.log('✅ dist/index.html generato');
})();
