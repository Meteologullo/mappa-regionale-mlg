const express = require('express');
const app = express();
const port = 3000;

// Serve i file HTML e JS della mappa
app.use(express.static(__dirname));

app.listen(port, () => {
  console.log(`🌐 Server avviato su http://localhost:${port}`);
});

