import { resolve } from "node:path";
import { config } from "dotenv";

// テスト環境の環境変数を読み込み
// .env.test > .env.local > .env の優先順位
const envFiles = [".env.test", ".env.local", ".env"];

for (const envFile of envFiles) {
  const path = resolve(process.cwd(), envFile);
  const result = config({ path });
  if (result.parsed) {
    console.log(`✓ Loaded environment variables from ${envFile}`);
    break;
  }
}

// テスト環境のデフォルト設定
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "test";
}

if (!process.env.DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL is not set. Some tests may fail.");
}
