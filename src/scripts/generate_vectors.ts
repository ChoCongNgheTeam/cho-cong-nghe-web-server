import { syncAllProducts } from '../app/modules/chatbot/sync/embedding.sync';

async function run() {
  await syncAllProducts();
  process.exit(0);
}

run();
