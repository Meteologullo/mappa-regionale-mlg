import puppeteer from "puppeteer";
import { resolve } from "path";

/* Puntiamo al tuo file esistente mlgmap.html */
const fileURL = resolve("mlgmap.html");

export async function buildHTML() {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page    = await browser.newPage();

  /* Carica la pagina locale e aspetta che abbia finito le fetch */
  await page.goto(`file://${fileURL}`, { waitUntil: "networkidle0" });

  /* Se un giorno aggiungi:  window.mappaPronta = true  nel tuo JS,
     questa riga aspetterà quel segnale; per ora non succede nulla */
  await page.waitForFunction("window.mappaPronta===true").catch(()=>{});

  /* Serializza l'HTML finale con i marker già dentro */
  const html = await page.content();
  await browser.close();
  return html;
}
