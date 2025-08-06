const express = require("express");
const path = require("path");
const app = express();
const port = 8080;

// Servi i file statici
app.use(express.static(path.join(__dirname, "..")));

app.listen(port, () => {
  console.log(`🌐 Server in ascolto sulla porta ${port}`);
});

// Avvia lo script di prerendering
require("./preload.js");
