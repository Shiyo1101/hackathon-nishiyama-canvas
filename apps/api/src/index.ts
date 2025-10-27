import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./modules/auth";
import { publicSignageRoutes, signageRoutes } from "./modules/signage";

export * from "./modules/auth";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const PORT = Number(process.env.PORT) || 8000;

/**
 * メインアプリケーション
 */
const app = new Hono()
  // CORS設定
  .use(
    "/*",
    cors({
      origin: FRONTEND_URL,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "PUT", "DELETE", "PATCH", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  )
  // ヘルスチェック
  .get("/health", (c) =>
    c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    }),
  )
  // ルート
  .get("/", (c) =>
    c.json({
      message: "Nishiyama Canvas API",
      version: "0.1.0",
    }),
  );

/**
 * APIルート（Hono RPC用）
 */
const apiRoutes = new Hono()
  .route("/signages", signageRoutes)
  .route("/public/signages", publicSignageRoutes);

/**
 * ルートをマウント
 */
app.route("/api", apiRoutes);

// Better Auth は独自のハンドラーを使用
app.all("/api/auth/*", (c) => auth.handler(c.req.raw));

/**
 * サーバー起動
 */
console.log(`🚀 Server is running on http://localhost:${PORT}`);

serve({
  fetch: app.fetch,
  port: PORT,
});

/**
 * Hono RPC用の型エクスポート
 */
export type AppType = typeof apiRoutes;
