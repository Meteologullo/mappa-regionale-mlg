const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { exec } = require('child_process');

const LOCAL_PORT = 3000;
const LOCAL_URL = `http://localhost:${LOCAL_PORT}/start.html`; // o il tuo file di partenza dinamico
const outputDir = path.join(__dirname, '..', 'dist');
const outputPath = path.join(outputDir, 'index.html');

// Avvia il server (modifica questo comando se usi altro)
const startServer = () => {
  return new Promise((resolve, reject) => {
    const server = exec('node server/index.js', (error) => {
      if (error) {
        reject(error);
      }
    });
    // Aspetta un paio di secondi per dare tempo al server di partire
    setTimeout(() => resolve(server), 3000);
  });
};

// Genera l'HTML statico
(async () => {
  let server;
  try {
    console.log('🚀 Avvio del server...');
    server = await startServer();

    console.log('🧠 Apro la pagina con Puppeteer...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle0', timeout: 0 });
    const html = await page.content();

    console.log('💾 Scrivo il file HTML renderizzato...');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, html);

    console.log(`✅ File salvato in: ${outputPath}`);
    await browser.close();
    server.kill(); // Chiudi il server

  } catch (err) {
    console.error('❌ Errore:', err);
    if (server) server.kill();
    process.exit(1);
  }
})();
