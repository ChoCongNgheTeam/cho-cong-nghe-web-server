import OpenAI from "openai";
import { env } from "../config/env";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const client = new OpenAI({
    apiKey: process.env.FIREWORKS_API_KEY,
    baseURL: "https://api.fireworks.ai/inference/v1",
  });

  try {
    const response = await client.chat.completions.create({
      model: "accounts/fireworks/models/deepseek-v4-flash",
      messages: [{ role: "user", content: "Say hello" }],
      max_tokens: 10,
    });
    console.log("DEEPSEEK SUCCESS:", response.choices[0].message.content);
  } catch (err: any) {
    console.error("DEEPSEEK ERROR:", err.message);
  }
}

main();
