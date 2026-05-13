import { queryDatabase } from "./lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Embedding model
const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-001",
});

// Chat model
const chatModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// Generate embedding for query
async function generateEmbedding(text: string) {
  const result = await embeddingModel.embedContent(text);

  return result.embedding.values;
}

// Generate grounded RAG response
async function generateResponse(question: string, context: string[]) {
  const prompt = `
You are a helpful assistant.

Use ONLY the provided context to answer the question.

If the answer is not present in the context, say:
"I don't know based on the provided context."

Context:
${context.join("\n\n")}

Question:
${question}
`;

  let retries = 5;

  while (retries > 0) {
    try {
      const result = await chatModel.generateContent(prompt);

      return result.response.text();
    } catch (err: any) {
      if (err.status === 503) {
        console.log("Gemini overloaded. Retrying in 10 seconds...");

        await new Promise((res) => setTimeout(res, 10000));

        retries--;
      } else {
        throw err;
      }
    }
  }

  throw new Error("Gemini API unavailable after retries.");
}

// Main RAG pipeline
async function askQuestion(question: string) {
  // Generate embedding
  const embedding = await generateEmbedding(question);

  // Query Astra DB
  const queryRes = await queryDatabase(embedding);

  // Debug retrieved chunks
  console.log("Retrieved Documents:");
  console.log(queryRes);

  // Generate final answer
  const response = await generateResponse(
    question,
    queryRes.map((doc) => doc.text),
  );

  return response;
}

// Test query
askQuestion(
  "Why are George Russell and Max Verstappen arguing after Qatar 2024?",
)
  .then((res) => {
    console.log("\nFinal Response:\n");
    console.log(res);
  })
  .catch((err) => {
    console.error(err);
  });
