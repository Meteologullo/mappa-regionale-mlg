import puppeteer from "puppeteer";
import { resolve } from "path";

const fileURL = resolve("mlgmap.html");

export async function buildHTML() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  // Capturiamo la risposta dei dati (API Open-Meteo)
  let apiData = null;
  page.on("response", async resp => {
    const u = resp.url();
    if (u.includes("api.open-meteo.com")) {
      try { apiData = await resp.json(); }
      catch {}
    }
  });

  // Carichiamo la pagina e aspettiamo che Leaflet abbia finito di posizionare i marker
  await page.goto(`file://${fileURL}`, { waitUntil: "networkidle0", timeout: 60000 });
  // Aspettiamo esplicitamente tutti i marker:   (adatta il selettore ai tuoi marker)
  await page.waitForSelector(".leaflet-marker-icon", { timeout: 10000 });

  // Preleviamo l'HTML
  let html = await page.content();
  await browser.close();

  // Iniettiamo JSON + override Leaflet
  if (apiData) {
    const jsonTxt = JSON.stringify(apiData).replace(/</g, "\\u003c");
    const injection = `
      <script id="preloaded-data" type="application/json">
        ${jsonTxt}
      </script>
      <script>
        // Sovrascrivo il loader di tile di Leaflet per disabilitare ogni fetch lato client
        L.TileLayer.prototype.createTile = () => document.createElement('div');
        // Sovrascrivo fetch in genere, così non parte nessuna richiesta
        window.fetch = () => Promise.resolve({ ok:true, json:() => Promise.resolve(${jsonTxt}) });
      </script>
    `;
    html = html.replace("</head>", injection + "</head>");
  }

  return html;
}
