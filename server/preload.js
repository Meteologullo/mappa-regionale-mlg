import puppeteer from "puppeteer";
import { resolve } from "path";

const fileURL = resolve("mlgmap.html");

export async function buildScreenshot() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  await page.goto(`file://${fileURL}`, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });
  await page.waitForTimeout(5000);

  const mapElement = await page.$("#map");
  const buffer = await mapElement.screenshot({ type: "png" });

  await browser.close();
  return buffer;
}
