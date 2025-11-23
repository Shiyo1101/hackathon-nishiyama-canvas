/**
 * Nishiyama Canvas API
 * エントリーポイント
 */
import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { prisma } from "./lib/db";
import {
  animalsRoutes,
  createAdminAnimalsRoutes,
  createAnimalsRepository,
  createAnimalsService,
} from "./modules/animals";
import { auth } from "./modules/auth";
import {
  createAdminNewsRoutes,
  createNewsRepository,
  createNewsService,
  newsRoutes,
} from "./modules/news";
import {
  createAdminReportRoutes,
  createReportHandlers,
  createReportRepository,
  createReportRoutes,
  createReportService,
} from "./modules/report";
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
import { createAdminUserRoutes, createUserRepository, createUserService } from "./modules/user";
import { createUserImagesRoutes } from "./modules/user-images";
import { createWeatherRoutes } from "./modules/weather";

/**
 * 型定義のエクスポート
 * フロントエンド（apps/web）から @api でインポート可能
 */
export * from "./modules/animals";
export * from "./modules/auth";
export * from "./modules/news";
export * from "./modules/report";
export * from "./modules/signage";
export * from "./modules/upload";
export * from "./modules/user";
export * from "./modules/user-images";
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
const signageHandlers = createSignageHandlers(signageService, signageRepository);

const reportRepository = createReportRepository(prisma);
const reportService = createReportService(reportRepository, prisma);
const reportHandlers = createReportHandlers(reportService);

const newsRepository = createNewsRepository(prisma);
const newsService = createNewsService(newsRepository);

const animalsRepository = createAnimalsRepository(prisma);
const animalsService = createAnimalsService(animalsRepository);

const userRepository = createUserRepository(prisma);
const userService = createUserService(userRepository);

/**
 * ルート定義
 * Hono RPCの型推論を保持するため、全てのルートを1つのHonoインスタンスにマージ
 *
 * IMPORTANT: Hono RPCの制約により、`.route()`を使用すると型推論が壊れます。
 * そのため、以下のアプローチを採用:
 * 1. 各ルートをファクトリー関数で作成
 * 2. basePath付きルートはそのまま`.route("")`でマージ
 * 3. basePath無しルートは`.route("/path", ...)`でマージ
 *
 * 注: この制約により、upload/user-imagesルートの型推論が一部失われる可能性があります。
 * 完全な型安全性が必要な場合は、全エンドポイントを直接メソッドチェーンで定義してください。
 */
const signageRoutesInstance = createSignageRoutes(signageHandlers);
const publicSignageRoutesInstance = createPublicSignageRoutes(signageHandlers);
const favoriteRoutesInstance = createFavoriteRoutes(signageHandlers);
const reportRoutesInstance = createReportRoutes(reportHandlers);
const adminReportRoutesInstance = createAdminReportRoutes(reportHandlers);
const adminNewsRoutesInstance = createAdminNewsRoutes(newsService);
const adminAnimalsRoutesInstance = createAdminAnimalsRoutes(animalsService);
const adminUserRoutesInstance = createAdminUserRoutes(userService);
const themeRoutesInstance = createThemeRoutes();
const weatherRoutesInstance = createWeatherRoutes();
const uploadRoutesInstance = createUploadRoutes();
const userImagesRoutesInstance = createUserImagesRoutes();

const routes = new Hono()
  .route("/signages", signageRoutesInstance)
  .route("/favorites", favoriteRoutesInstance)
  .route("/reports", reportRoutesInstance)
  .route("/admin/reports", adminReportRoutesInstance)
  .route("", adminNewsRoutesInstance)
  .route("", adminAnimalsRoutesInstance)
  .route("", adminUserRoutesInstance)
  .route("/themes", themeRoutesInstance)
  .route("/weather", weatherRoutesInstance)
  .route("/upload", uploadRoutesInstance)
  .route("/user-images", userImagesRoutesInstance)
  .route("/public", publicSignageRoutesInstance)
  // newsとanimalsはbasePath()を使用しているため、直接routeせずにマージ
  .route("", newsRoutes)
  .route("", animalsRoutes);

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
