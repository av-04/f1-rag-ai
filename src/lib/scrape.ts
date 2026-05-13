import playwright from "playwright";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function scrape(url: string) {
  console.log(`Scraping: ${url}`);

  const browser = await playwright.chromium.launch();

  const context = await browser.newContext();

  const page = await context.newPage();

  await page.goto(url);

  const text = await page.innerText("body");

  const cleanedText = text.replace(/\n/g, " ");

  await browser.close();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 200,
  });

  const output = await splitter.createDocuments([cleanedText]);

  console.log(`Created ${output.length} chunks from ${url}`);

  return output;
}
