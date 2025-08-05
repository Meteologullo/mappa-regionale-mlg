// server/preload.js
import puppeteer from "puppeteer";
import { resolve } from "path";

const fileURL = resolve("mlgmap.html");

export async function buildHTML() {
  // 1) Lancio Puppeteer headless
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  // 2) Lista di URL da “catturare”
  let apiResponse = null;
  page.on("response", async resp => {
    const url = resp.url();
    if (url.includes("api.open-meteo.com")) {
      try {
        apiResponse = await resp.json();
      } catch {}
    }
  });

  // 3) Carica la pagina, aspetta il DOM
  await page.goto(`file://${fileURL}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  // dammi 5s per le operazioni JS/fetch
  await page.waitForTimeout(5000);

  // 4) Prendi l'HTML risultante
  let html = await page.content();
  await browser.close();

  // 5) Se ho intercettato i dati, inietto il JSON + override di fetch
  if (apiResponse) {
    const jsonTxt = JSON.stringify(apiResponse)
      .replace(/</g, "\\u003c"); // evita collisioni con HTML
    const injection = `
      <script id="preloaded-data" type="application/json">
        ${jsonTxt}
      </script>
      <script>
        // Sovrascrivo fetch per restituire subito i dati prerenderizzati
        const PRELOADED = JSON.parse(
          document.getElementById("preloaded-data").textContent
        );
        window.fetch = (url, opts) =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(PRELOADED)
          });
      </script>
    `;
    // inietto subito prima di </head>
    html = html.replace("</head>", injection + "</head>");
  }

  return html;
}
