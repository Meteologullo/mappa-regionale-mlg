import puppeteer from "puppeteer";
import { resolve } from "path";

const fileURL = resolve("mlgmap.html");   // il tuo file esistente

export async function buildHTML() {
  // usa il nuovo headless e aumenta i permessi
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  // 1) carica l'HTML (domcontentloaded) con timeout 60s
  await page.goto(`file://${fileURL}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  // 2) aspetta 5 secondi per le fetch della mappa
  await page.waitForTimeout(5000);

  // 3) cattura il DOM finale
  const html = await page.content();
  await browser.close();
  return html;
}
