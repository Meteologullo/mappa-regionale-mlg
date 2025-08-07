const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { exec } = require('child_process');

const LOCAL_PORT = 3000;
const LOCAL_URL = `http://localhost:${LOCAL_PORT}/start.html`;
const outputDir = path.join(__dirname, '..', 'dist');
const outputPath = path.join(outputDir, 'index.html');

const startServer = () => {
  return new Promise((resolve, reject) => {
    const server = exec('node server/index.js', (error) => {
      if (error) reject(error);
    });
    setTimeout(() => resolve(server), 3000);
  });
};

(async () => {
  let server;
  try {
    console.log('🚀 Avvio server...');
    server = await startServer();

    console.log('🧠 Render pagina...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(LOCAL_URL, { waitUntil: 'networkidle0', timeout: 0 });

    const html = await page.content();

    console.log('💾 Salvataggio in /dist/index.html...');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, html);

    await browser.close();
    server.kill();
    console.log('✅ Fatto!');

  } catch (err) {
    console.error('❌ Errore:', err);
    if (server) server.kill();
    process.exit(1);
  }
})();

