const fs = require('fs');
const path = require('path');

// Percorso del file sorgente (mlgmap.html)
const inputPath = path.join(__dirname, '..', 'mlgmap.html');

// Cartella di output (dist/index.html)
const outputDir = path.join(__dirname, '..', 'dist');
const outputPath = path.join(outputDir, 'index.html');

try {
  const html = fs.readFileSync(inputPath, 'utf8');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, html);
  console.log(`✅ File "mappa calda" generato correttamente in ${outputPath}`);
} catch (err) {
  console.error('❌ Errore durante la generazione:', err);
  process.exit(1);
}
