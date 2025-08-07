const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const app = express();
app.use(express.static(path.join(__dirname, '..')));
const server = app.listen(PORT, async () => {
  console.log('🚀 Server avviato');

  try {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    console.log('🌍 Carico la pagina...');
    await page.goto(`http://localhost:${PORT}/mlgmap.html`, { waitUntil: 'networkidle2', timeout: 180000 }); // 3 minuti

    const html = await page.content();

    const outputDir = path.join(__dirname, '..', 'dist');
    const outputPath = path.join(outputDir, 'mlgmap.html');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    fs.writeFileSync(outputPath, html);
    console.log('✅ Pagina salvata in dist/mlgmap.html');

    await browser.close();
    server.close();
  } catch (error) {
    console.error('❌ Errore nel prerender:', error);
    server.close();
    process.exit(1);
  }
});

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
