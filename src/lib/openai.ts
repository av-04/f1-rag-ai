// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";

async function main() {
  const ai = new GoogleGenAI({
    apiKey: process.env["GEMINI_API_KEY"],
  });
  const config = {
    thinkingConfig: {
      thinkingLevel: ThinkingLevel.MINIMAL,
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, // Block most
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, // Block most
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, // Block most
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, // Block most
      },
    ],
  };
  const model = "gemini-flash-lite-latest";
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `INSERT_INPUT_HERE`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  let fileIndex = 0;
  for await (const chunk of response) {
    if (chunk.text) {
      console.log(chunk.text);
    }
  }
}

main();
