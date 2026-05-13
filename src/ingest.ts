import { createCollection, uploadData } from "./lib/db";
import { scrape } from "./lib/scrape";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Create embedding model once
const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-001",
});

// Start with ONE URL while testing
const urls = ["https://en.wikipedia.org/wiki/Formula_One"];

async function ingest() {
  let chunks: { text: string; $vector: number[]; url: string }[] = [];

  for (const url of urls) {
    console.log(`Scraping: ${url}`);

    const data = (await scrape(url)).slice(0, 2);

    const embeddings: number[][] = [];

    // Sequential embedding generation
    for (const doc of data) {
      console.log("Generating embedding...");

      const result = await embeddingModel.embedContent(doc.pageContent);

      embeddings.push(result.embedding.values);

      // Delay to avoid Gemini rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Store chunks
    chunks = chunks.concat(
      data.map((doc, index) => ({
        text: doc.pageContent,
        $vector: embeddings[index],
        url: url,
      })),
    );
  }

  console.log("Creating Astra collection...");

  try {
    await createCollection();
  } catch (err) {
    console.log("Collection may already exist.");
  }

  console.log("Uploading vectors...");

  await uploadData(
    chunks.map((doc) => ({
      $vector: doc.$vector,
      text: doc.text,
      source: doc.url,
    })),
  );

  console.log("Ingestion complete!");
}

ingest();
