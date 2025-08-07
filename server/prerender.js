const fs = require('fs');
const path = require('path');

// QUI puoi incollare la tua mappa HTML vera e propria (o importar da file)
const html = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Mappa Calda</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <h1>Mappa Regionale Calda</h1>
  <p>Qui va inserito il contenuto HTML vero della mappa!</p>
</body>
</html>
`;

// Percorso di output
const outputDir = path.join(__dirname, '..', 'dist');
const outputPath = path.join(outputDir, 'index.html');

// Crea la cartella dist se non esiste
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Scrive il file HTML
fs.writeFileSync(outputPath, html);
console.log(`✅ File HTML prerenderizzato creato in: ${outputPath}`);
