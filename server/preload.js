import puppeteer from "puppeteer";
import { resolve } from "path";
const fileURL = resolve("mlgmap.html");   // la tua pagina già nel repo

export async function buildHTML() {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page    = await browser.newPage();
  await page.goto(`file://${fileURL}`, { waitUntil: "networkidle0" });
  // se un giorno aggiungi  window.mappaPronta = true  la riga sotto aspetterà quel segnale
  await page.waitForFunction("window.mappaPronta===true").catch(()=>{});
  const html = await page.content();
  await browser.close();
  return html;
}
