/**
 * Nishiyama Canvas API
 * エントリーポイント
 */
import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { prisma } from "./lib/db";
import { createAnimalsRoutes } from "./modules/animals";
import { auth } from "./modules/auth";
import { createNewsRoutes } from "./modules/news";
import {
  createFavoriteRoutes,
  createPublicSignageRoutes,
  createSignageHandlers,
  createSignageRoutes,
} from "./modules/signage";
import { createSignageRepository } from "./modules/signage/signage.repository";
import { createSignageService } from "./modules/signage/signage.service";
import { createThemeRoutes } from "./modules/theme";
import { createUploadRoutes } from "./modules/upload";
import { createWeatherRoutes } from "./modules/weather";

/**
 * 型定義のエクスポート
 * フロントエンド（apps/web）から @api でインポート可能
 */
export * from "./modules/animals";
export * from "./modules/auth";
export * from "./modules/news";
export * from "./modules/signage";
export * from "./modules/upload";
export * from "./types";

/**
 * 環境変数
 */
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
  .get("/", (c) =>
    c.json({
      message: "Nishiyama Canvas API",
      version: "0.1.0",
    }),
  );

/**
 * サービス初期化
 */
const signageRepository = createSignageRepository(prisma);
const signageService = createSignageService(signageRepository);
const signageHandlers = createSignageHandlers(signageService);

/**
 * ルート定義
 * Hono RPCの型推論を保持するため、直接ルートを定義
 */
const signageRoutes = createSignageRoutes(signageHandlers);
const publicSignageRoutes = createPublicSignageRoutes(signageHandlers);
const favoriteRoutes = createFavoriteRoutes(signageHandlers);
const animalsRoutes = createAnimalsRoutes();
const newsRoutes = createNewsRoutes();
const themeRoutes = createThemeRoutes();
const weatherRoutes = createWeatherRoutes();
const uploadRoutes = createUploadRoutes();

const routes = new Hono()
  .route("/signages", signageRoutes)
  .route("/favorites", favoriteRoutes)
  .route("/animals", animalsRoutes)
  .route("/news", newsRoutes)
  .route("/themes", themeRoutes)
  .route("/weather", weatherRoutes)
  .route("/upload", uploadRoutes)
  .route("/public", publicSignageRoutes);

/**
 * APIルートをマウント
 */
app.route("/api", routes);

/**
 * Better Auth ハンドラー
 */
app.all("/api/auth/*", (c) => auth.handler(c.req.raw));

/**
 * 型エクスポート（Hono RPC用）
 */
export type AppType = typeof routes;

/**
 * サーバー起動（本番環境以外）
 */
if (process.env.NODE_ENV !== "production") {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);

  serve({
    fetch: app.fetch,
    port: PORT,
  });
}
