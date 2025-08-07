const fs = require('fs');
const path = require('path');

// Percorso del file HTML sorgente (quello con la mappa vera)
const inputPath = path.join(__dirname, '..', 'mlgmap.html');

// Percorso della cartella di output
const outputDir = path.join(__dirname, '..', 'dist');
const outputPath = path.join(outputDir, 'index.html');

try {
  // Leggi il contenuto del file HTML
  const html = fs.readFileSync(inputPath, 'utf8');

  // Crea la cartella dist se non esiste
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Scrivi il file nella cartella dist
  fs.writeFileSync(outputPath, html);
  console.log(`✅ File HTML copiato in: ${outputPath}`);
} catch (err) {
  console.error('❌ Errore nella generazione del file HTML:', err);
  process.exit(1);
}
