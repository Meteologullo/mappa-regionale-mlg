// server/prerender.js

const fs = require('fs');
const path = require('path');

// Crea una directory "dist" se non esiste
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copia index.html dentro dist/
const sourceFile = path.join(__dirname, '..', 'index.html');
const destFile = path.join(distDir, 'index.html');

fs.copyFileSync(sourceFile, destFile);
console.log('index.html copiato in dist/index.html');
