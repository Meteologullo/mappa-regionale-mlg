// prerender.js
import puppeteer from "puppeteer";
import { writeFile } from "fs/promises";
import { resolve } from "path";

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  // Allinea il viewport a 1920x1080 (o a quello che serve)
  await page.setViewport({ width: 1920, height: 1080 });

  // Carica la pagina locale
  const fileURL = "file://" + resolve("mlgmap.html");
  await page.goto(fileURL, { waitUntil: "networkidle0", timeout: 60000 });
  await page.waitForTimeout(5000);

  // Serializza l'HTML finale
  const html = await page.content();
  await browser.close();

  // Scrive l'HTML prerenderizzato in index.html
  await writeFile("prerendered.html", html);
  console.log("✅ HTML prerenderizzato salvato");
})();
