import OpenAI from "openai";

async function test() {
  console.log("Testing Hugging Face Space: aetman/wms...");
  const openai = new OpenAI({
    apiKey: "hf_dummy", // Không cần key nếu space public, hoặc điền HF token
    baseURL: "https://aetman-wms.hf.space/v1",
  });

  try {
    const models = await openai.models.list();
    console.log("Available models:", models.data.map(m => m.id));

    const modelToUse = models.data.length > 0 ? models.data[0].id : "default";

    console.log(`Sending chat completion request to model: ${modelToUse}...`);
    const response = await openai.chat.completions.create({
      model: modelToUse,
      messages: [{ role: "user", content: "Xin chào, bạn là ai?" }],
      max_tokens: 50,
    });

    console.log("Response:", response.choices[0].message.content);
  } catch (error: any) {
    console.error("Error connecting to HF Space:");
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

test();
