/**
 * Canvasルート定義
 *
 * ミドルウェアを適用せず、型推論を最適化
 * ハンドラーロジックは canvas.handlers.ts に分離
 */
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { AuthenticatedVariables } from "../auth";
import { authMiddleware, requireAuth } from "../auth";
import type { CanvasHandlers } from "./canvas.handlers";
import {
  CreateCanvasRequestSchema,
  PublishCanvasRequestSchema,
  UpdateCanvasRequestSchema,
} from "./canvas.schemas";

export type {
  CreateCanvasInput,
  LayoutConfig,
  PublishCanvasInput,
  UpdateCanvasInput,
} from "./canvas.schemas";
/**
 * Zodスキーマと型定義は canvas.schemas.ts からエクスポート
 */
export {
  CreateCanvasRequestSchema,
  LayoutConfigSchema,
  PublishCanvasRequestSchema,
  UpdateCanvasRequestSchema,
} from "./canvas.schemas";

/**
 * ルート定義ファクトリー
 *
 * ミドルウェアをハンドラー引数として渡すことで型推論を保持
 */
export const createCanvasRoutes = (handlers: CanvasHandlers) => {
  return new Hono<{ Variables: AuthenticatedVariables }>()
    .get("/me", authMiddleware, requireAuth, handlers.getUserCanvas)
    .post(
      "/",
      authMiddleware,
      requireAuth,
      zValidator("json", CreateCanvasRequestSchema),
      handlers.createCanvas,
    )
    .put(
      "/:id",
      authMiddleware,
      requireAuth,
      zValidator("json", UpdateCanvasRequestSchema),
      handlers.updateCanvas,
    )
    .patch(
      "/:id/publish",
      authMiddleware,
      requireAuth,
      zValidator("json", PublishCanvasRequestSchema),
      handlers.updatePublishStatus,
    )
    .delete("/:id", authMiddleware, requireAuth, handlers.deleteCanvas);
};

/**
 * 公開キャンバスルート（認証不要）
 */
export const createPublicCanvasRoutes = (handlers: CanvasHandlers) => {
  return new Hono()
    .get("/canvases/popular", handlers.getPopularCanvases)
    .get("/canvases/:slug", handlers.getPublicCanvas);
};

/**
 * お気に入りルート（認証必要）
 */
export const createFavoriteRoutes = (handlers: CanvasHandlers) => {
  return new Hono<{ Variables: AuthenticatedVariables }>()
    .get("/", authMiddleware, requireAuth, handlers.getFavoriteCanvases)
    .post("/:canvasId", authMiddleware, requireAuth, handlers.addFavorite)
    .delete("/:canvasId", authMiddleware, requireAuth, handlers.removeFavorite);
};

/**
 * エクスポート
 */
export { authMiddleware, requireAuth };
export type { AuthenticatedVariables };
