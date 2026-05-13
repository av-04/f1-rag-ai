import "dotenv/config";
import { DataAPIClient } from "@datastax/astra-db-ts";

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN!);

const db = client.db(process.env.ASTRA_DB_API_ENDPOINT!);

// NEW COLLECTION NAME
const collection = db.collection("f1gpt2");

export async function createCollection() {
  try {
    const res = await db.createCollection("f1gpt2", {
      vector: {
        // Gemini embedding dimension
        dimension: 3072,
        metric: "dot_product",
      },
    });

    console.log("Collection created!");

    return res;
  } catch (err) {
    console.log("Collection may already exist.");
  }
}

export async function uploadData(
  data: {
    $vector: number[];
    text: string;
    source: string;
  }[],
) {
  return await collection.insertMany(data);
}

export async function queryDatabase(query: number[]) {
  const res = await collection
    .find(null, {
      sort: {
        $vector: query,
      },
      limit: 10,
    })
    .toArray();

  return res;
}
