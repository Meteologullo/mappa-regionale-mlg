const express = require("express");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const port = 8080;

app.use(express.static(path.join(__dirname, "..")));

app.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
  exec("node server/preload.js", (err, stdout, stderr) => {
    if (err) {
      console.error("Errore prerender:", stderr);
    } else {
      console.log("Prerender completato");
    }
  });
});
