const puppeteer = require("puppeteer");
const { resolve } = require("path");

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const fileURL = resolve("mlgmap.html");

exports.buildHTML = async function () {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"]
  });

  const page = await browser.newPage();

  // Intercetta tile e dati
  let apiData = null;
  const tileBuffers = {};

  page.on("response", async (resp) => {
    const url = resp.url();

    // Dati Open-Meteo
    if (url.includes("api.open-meteo.com")) {
      try {
        apiData = await resp.json();
      } catch {}
    }

    // Tile immagine (OpenStreetMap)
    if (/tile\.openstreetmap\.org/.test(url)) {
      try {
        const buf = await resp.buffer();
        tileBuffers[url] = buf.toString("base64");
      } catch {}
    }
  });

  // Carica pagina
  await page.goto(`file://${fileURL}`, {
    waitUntil: "networkidle0",
    timeout: 60000
  });

  await page.waitForTimeout(5000);

  // Prendi HTML
  let html = await page.content();
  await browser.close();

  // Inietta i dati
  if (apiData) {
    const jsonTxt = JSON.stringify(apiData).replace(/</g, "\\u003c");
    const injection = `
      <script id="preloaded-data" type="application/json">
        ${jsonTxt}
      </script>
      <script>
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

  // Sostituisci tile con data URI
  for (const [url, b64] of Object.entries(tileBuffers)) {
    const dataUri = `data:image/png;base64,${b64}`;
    html = html.replace(
      new RegExp(escapeRegExp(url), "g"),
      dataUri
    );
  }

  return html;
};

