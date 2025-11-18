/**
 * Signageルート定義
 *
 * ミドルウェアを適用せず、型推論を最適化
 * ハンドラーロジックは signage.handlers.ts に分離
 */
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import type { AuthenticatedVariables } from "../auth";
import { authMiddleware, requireAuth } from "../auth";
import type { SignageHandlers } from "./signage.handlers";

/**
 * Zodスキーマ定義
 */
const LayoutConfigSchema = z.object({
  template_id: z.string(),
  background: z.object({
    type: z.enum(["color", "image"]),
    color: z.string().optional(),
    url: z.string().optional(),
  }),
  grid: z
    .object({
      columns: z.number().int().min(1).max(24),
      rows: z.number().int().min(1).max(24),
    })
    .optional(),
  items: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["news", "animal", "text", "image", "user_image"]),
      position: z.object({
        x: z.number().int().min(0),
        y: z.number().int().min(0),
        w: z.number().int().min(1),
        h: z.number().int().min(1),
      }),
      contentId: z.string().optional(),
      settings: z.record(z.string(), z.unknown()).optional(),
    }),
  ),
});

export const CreateSignageRequestSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  layoutConfig: LayoutConfigSchema,
});

export const UpdateSignageRequestSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  layoutConfig: LayoutConfigSchema.optional(),
});

export const PublishSignageRequestSchema = z.object({
  isPublic: z.boolean(),
});

/**
 * 型定義（Zodスキーマから推論）
 */
export type LayoutConfig = z.infer<typeof LayoutConfigSchema>;
export type CreateSignageInput = z.infer<typeof CreateSignageRequestSchema>;
export type UpdateSignageInput = z.infer<typeof UpdateSignageRequestSchema>;
export type PublishSignageInput = z.infer<typeof PublishSignageRequestSchema>;

/**
 * ルート定義ファクトリー
 *
 * ミドルウェアをハンドラー引数として渡すことで型推論を保持
 */
export const createSignageRoutes = (handlers: SignageHandlers) => {
  return new Hono<{ Variables: AuthenticatedVariables }>()
    .get("/me", authMiddleware, requireAuth, handlers.getUserSignage)
    .post(
      "/",
      authMiddleware,
      requireAuth,
      zValidator("json", CreateSignageRequestSchema),
      handlers.createSignage,
    )
    .put(
      "/:id",
      authMiddleware,
      requireAuth,
      zValidator("json", UpdateSignageRequestSchema),
      handlers.updateSignage,
    )
    .patch(
      "/:id/publish",
      authMiddleware,
      requireAuth,
      zValidator("json", PublishSignageRequestSchema),
      handlers.updatePublishStatus,
    )
    .delete("/:id", authMiddleware, requireAuth, handlers.deleteSignage);
};

/**
 * 公開サイネージルート（認証不要）
 */
export const createPublicSignageRoutes = (handlers: SignageHandlers) => {
  return new Hono()
    .get("/signages/popular", handlers.getPopularSignages)
    .get("/signages/:slug", handlers.getPublicSignage);
};

/**
 * お気に入りルート（認証必要）
 */
export const createFavoriteRoutes = (handlers: SignageHandlers) => {
  return new Hono<{ Variables: AuthenticatedVariables }>()
    .get("/", authMiddleware, requireAuth, handlers.getFavoriteSignages)
    .post("/:signageId", authMiddleware, requireAuth, handlers.addFavorite)
    .delete("/:signageId", authMiddleware, requireAuth, handlers.removeFavorite);
};

/**
 * エクスポート
 */
export { LayoutConfigSchema };
export { authMiddleware, requireAuth };
export type { AuthenticatedVariables };
