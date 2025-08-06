// server/preload.js
import puppeteer from "puppeteer";
import { resolve } from "path";

/**
 * Escapa una stringa per usarla in new RegExp(...)
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const fileURL = resolve("mlgmap.html");

export async function buildHTML() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"]
  });
  const page = await browser.newPage();

  // 1) Intercettiamo i JSON di dati e le risposte delle tile
  let apiData = null;
  const tileBuffers = {};  // url -> base64

  page.on("response", async resp => {
    const url = resp.url();

    // 1a) dati Open–Meteo
    if (url.includes("api.open-meteo.com")) {
      try {
        apiData = await resp.json();
      } catch {}
    }

    // 1b) immagini tile di Leaflet (OpenStreetMap)
    if (/tile\.openstreetmap\.org/.test(url)) {
      try {
        const buf = await resp.buffer();
        tileBuffers[url] = buf.toString("base64");
      } catch {}
    }
  });

  // 2) Carichiamo la pagina e aspettiamo il rendering completo
  await page.goto(`file://${fileURL}`, {
    waitUntil: "networkidle0",
    timeout: 60000
  });
  // attendiamo qualche secondo in più per sicurezza
  await page.waitForTimeout(5000);

  // 3) Prendiamo l'HTML finale
  let html = await page.content();
  await browser.close();

  // 4) Iniettiamo il JSON pre-caricato e l'override di fetch SOLO per Open-Meteo
  if (apiData) {
    const jsonTxt = JSON.stringify(apiData).replace(/</g, "\\u003c");
    const injection = `
      <script id="preloaded-data" type="application/json">
        ${jsonTxt}
      </script>
      <script>
        // override fetch solo per i dati meteo
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

  // 5) Sostituiamo tutte le URL delle tile con Data-URI
  for (const [url, b64] of Object.entries(tileBuffers)) {
    const dataUri = `data:image/png;base64,${b64}`;
    // replaciamo tutte le occorrenze della URL originale
    html = html.replace(
      new RegExp(escapeRegExp(url), "g"),
      dataUri
    );
  }

  return html;
}


