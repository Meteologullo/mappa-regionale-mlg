// scripts/build.js
/*
 * 1) Recupera i dati delle stazioni
 * 2) Scrive src/data.js   (esportando un array JS)
 * 3) Assicura che src/mlgmap.html lo carichi
 */
import fs from "node:fs/promises";
import fetch from "node-fetch";

const OUT_DIR   = "src";
const DATA_JS   = `${OUT_DIR}/data.js`;
const HTML_FILE = `${OUT_DIR}/mlgmap.html`;

// —— 1) scarico i dati (qui simulo; usa il tuo endpoint)
const url = "https://raw.githubusercontent.com/Meteologullo/mappa-regionale-mlg/main/src/stazioni.json";
const stazioni = await fetch(url).then(r => r.json());

// —— 2) salvo data.js (export globale)
const js = `/* auto-generated */\nwindow.STAZIONI = ${JSON.stringify(stazioni)};`;
await fs.writeFile(DATA_JS, js, "utf8");
console.log(`✅ scritto ${DATA_JS}`);

// —— 3) patch mlgmap.html (inietta <script src="data.js"> se manca)
let html = await fs.readFile(HTML_FILE, "utf8");
if (!html.includes("src=\"data.js\"")) {
  html = html.replace("</head>",
    `  <script src="data.js"></script>\n</head>`);
  await fs.writeFile(HTML_FILE, html, "utf8");
  console.log("✅ iniettato <script src=\"data.js\"> in mlgmap.html");
}
