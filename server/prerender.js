const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const express = require('express');

(async () => {
  const app = express();
  const PORT = 3000;

  app.use(express.static('.'));
  const server = app.listen(PORT, () => console.log('🚀 Server avviato'));

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    console.log('🌐 Carico pagina...');
    await page.goto(`http://localhost:${PORT}/mlgmap.html`, {
      waitUntil: 'networkidle0'
    });

    const content = await page.content();
    const outputPath = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);
    fs.writeFileSync(path.join(outputPath, 'index.html'), content);

    console.log('✅ Pagina renderizzata salvata!');
    await browser.close();
    server.close();
  } catch (err) {
    console.error('❌ Errore:', err);
    server.close();
    process.exit(1);
  }
})();
