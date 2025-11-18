import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E テスト設定
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  /* 並列実行の最大ワーカー数 */
  fullyParallel: true,
  /* CI環境でのみリトライを有効化 */
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  /* CI環境では並列実行を制限 */
  workers: process.env.CI ? 1 : undefined,
  /* レポート設定 */
  reporter: "html",
  /* 共通設定 */
  use: {
    /* ベースURL */
    baseURL: "http://localhost:3000",
    /* スクリーンショット */
    screenshot: "only-on-failure",
    /* トレース */
    trace: "on-first-retry",
  },

  /* プロジェクト設定 */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* テスト前にdevサーバーを起動 */
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
