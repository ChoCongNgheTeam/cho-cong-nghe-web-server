import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Start seeding...");

  try {
    console.log("Syncing vector embeddings...");

    const { syncAllProducts } = require("../src/app/modules/chatbot/sync/embedding.sync");

    await syncAllProducts();

    console.log("✅ Vector embeddings synced successfully!");
  } catch (error) {
    console.error("❌ Could not sync vector embeddings:", error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
