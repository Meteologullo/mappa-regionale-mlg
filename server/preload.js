// server/preload.js
import puppeteer from "puppeteer";
import { resolve } from "path";

const fileURL = resolve("mlgmap.html");

export async function buildScreenshot() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  // 1) Allineiamo il viewport all'area di mappa
  //    Adatta width/height ai pixel effettivi del tuo #map
  await page.setViewport({ width: 1920, height: 1080 });

  // 2) Carichiamo la pagina e attendiamo il rendering completo
  await page.goto(`file://${fileURL}`, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });
  // attendiamo qualche secondo in più per sicurezza
  await page.waitForTimeout(5000);

  // 3) Individuiamo il container #map e ne prendiamo bounding box
  const mapElement = await page.$("#map");
  const box        = await mapElement.boundingBox();

  // 4) Catturiamo lo screenshot esattamente di quell'area
  const buffer = await page.screenshot({
    clip: {
      x:      box.x,
      y:      box.y,
      width:  Math.ceil(box.width),
      height: Math.ceil(box.height),
    },
    type: "png",
  });

  await browser.close();
  return buffer;
}

