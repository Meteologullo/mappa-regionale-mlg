// server/preload.js
import puppeteer from "puppeteer";
import { resolve } from "path";

const fileURL = resolve("mlgmap.html");

export async function buildHTML() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  // 1) intercettiamo la risposta dei dati (API Open-Meteo)
  let apiData = null;
  page.on("response", async resp => {
    const url = resp.url();
    if (url.includes("api.open-meteo.com")) {
      try { apiData = await resp.json(); } catch {}
    }
  });

  // 2) carichiamo la pagina e aspettiamo tutti i marker
  await page.goto(`file://${fileURL}`, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });
  // attendiamo che i marker Leaflet siano tutti montati nel DOM
  await page.waitForSelector(".leaflet-marker-icon", { timeout: 10000 });

  // 3) prendiamo l'HTML generato
  let html = await page.content();
  await browser.close();

  // 4) iniettiamo il JSON e override **solo** fetch API
  if (apiData) {
    const jsonTxt = JSON.stringify(apiData).replace(/</g, "\\u003c");
    const injection = `
      <script id="preloaded-data" type="application/json">
        ${jsonTxt}
      </script>
      <script>
        // override fetch SOLO per l'endpoint Open-Meteo
        const realFetch = window.fetch;
        window.fetch = (url, opts) => {
          if (url.includes("api.open-meteo.com")) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(${jsonTxt})
            });
          }
          return realFetch(url, opts);
        };
      </script>
    `;
    html = html.replace("</head>", injection + "</head>");
  }

  return html;
}


