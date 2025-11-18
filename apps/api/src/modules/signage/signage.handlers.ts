/**
 * Signageハンドラーロジック
 *
 * ルート定義から分離して、テスタビリティと保守性を向上
 */
import type { Context } from "hono";
import type { Signage } from "../../lib/db";
import type { AuthenticatedVariables } from "../auth";
import type { SignageService } from "./signage.service";

/**
 * レスポンスのシリアライズ
 */
const serializeSignage = (signage: Signage | null) => {
  if (!signage) return null;
  return {
    ...signage,
    createdAt: signage.createdAt.toISOString(),
    updatedAt: signage.updatedAt.toISOString(),
    layoutConfig: signage.layoutConfig,
  };
};

/**
 * エラーハンドリング
 */
const handleError = (error: unknown, c: Context) => {
  console.error("Handler error:", error);
  if (error instanceof Error) {
    console.error("Error stack:", error.stack);
    if (error.message.includes("not found")) {
      return c.json({ success: false, error: error.message }, 404);
    }
    if (error.message.includes("already exists")) {
      return c.json({ success: false, error: error.message }, 409);
    }
    return c.json({ success: false, error: error.message }, 500);
  }
  return c.json({ success: false, error: "Unknown error" }, 500);
};

/**
 * ハンドラーファクトリー
 */
export const createSignageHandlers = (signageService: SignageService) => ({
  /**
   * GET /signages/me - 自分のサイネージを取得
   */
  getUserSignage: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const user = c.get("user");
    try {
      const signage = await signageService.getUserSignage(user.id);
      if (!signage) {
        return c.json({ success: false, error: "サイネージが見つかりません" }, 404);
      }
      const serializedSignage = serializeSignage(signage);
      if (!serializedSignage) {
        return c.json({ success: false, error: "サイネージのシリアライズに失敗しました" }, 500);
      }
      return c.json({ success: true, data: { signage: serializedSignage } }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * POST /signages - サイネージを作成
   */
  createSignage: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const user = c.get("user");
    // biome-ignore lint/suspicious/noExplicitAny: Hono型推論の制限により必要
    const body = (c.req as any).valid("json") as Parameters<SignageService["createSignage"]>[1];
    try {
      const signage = await signageService.createSignage(user.id, body);
      const serializedSignage = serializeSignage(signage);
      if (!serializedSignage) {
        throw new Error("Failed to serialize signage");
      }
      return c.json({ success: true, data: { signage: serializedSignage } }, 201);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * PUT /signages/:id - サイネージを更新
   */
  updateSignage: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const user = c.get("user");
    const id = c.req.param("id");
    // biome-ignore lint/suspicious/noExplicitAny: Hono型推論の制限により必要
    const body = (c.req as any).valid("json") as Parameters<SignageService["updateSignage"]>[2];
    try {
      const signage = await signageService.updateSignage(user.id, id, body);
      const serializedSignage = serializeSignage(signage);
      if (!serializedSignage) {
        throw new Error("Failed to serialize signage");
      }
      return c.json({ success: true, data: { signage: serializedSignage } }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * PATCH /signages/:id/publish - サイネージの公開状態を更新
   */
  updatePublishStatus: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const user = c.get("user");
    const id = c.req.param("id");
    // biome-ignore lint/suspicious/noExplicitAny: Hono型推論の制限により必要
    const { isPublic } = (c.req as any).valid("json") as { isPublic: boolean };
    try {
      const signage = await signageService.updatePublishStatus(user.id, id, isPublic);
      const serializedSignage = serializeSignage(signage);
      if (!serializedSignage) {
        throw new Error("Failed to serialize signage");
      }
      return c.json({ success: true, data: { signage: serializedSignage } }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * DELETE /signages/:id - サイネージを削除
   */
  deleteSignage: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const user = c.get("user");
    const id = c.req.param("id");
    try {
      await signageService.deleteSignage(user.id, id);
      return c.json({ success: true }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * GET /public/signages/:slug - 公開サイネージを取得
   */
  getPublicSignage: async (c: Context) => {
    const slug = c.req.param("slug");
    try {
      const signage = await signageService.getPublicSignage(slug);
      const serializedSignage = serializeSignage(signage);
      if (!serializedSignage) {
        throw new Error("Failed to serialize signage");
      }
      return c.json({ success: true, data: { signage: serializedSignage } }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * GET /public/signages/popular - 人気の公開サイネージ一覧を取得
   */
  getPopularSignages: async (c: Context) => {
    try {
      const limit = Number.parseInt(c.req.query("limit") ?? "10", 10);
      const signages = await signageService.getPopularSignages(limit);
      const serializedSignages = signages
        .map((signage) => serializeSignage(signage))
        .filter((s) => s !== null);
      return c.json({ success: true, data: { signages: serializedSignages } }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * GET /favorites - お気に入りサイネージ一覧を取得
   */
  getFavoriteSignages: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const user = c.get("user");
    try {
      const limit = Number.parseInt(c.req.query("limit") ?? "10", 10);
      const signages = await signageService.getFavoriteSignages(user.id, limit);
      const serializedSignages = signages
        .map((signage) => serializeSignage(signage))
        .filter((s) => s !== null);
      return c.json({ success: true, data: { signages: serializedSignages } }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * POST /favorites/:signageId - お気に入りに追加
   */
  addFavorite: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const user = c.get("user");
    const signageId = c.req.param("signageId");
    try {
      const result = await signageService.addFavorite(user.id, signageId);
      return c.json({ success: true, data: { favoriteId: result.id } }, 201);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * DELETE /favorites/:signageId - お気に入りから削除
   */
  removeFavorite: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const user = c.get("user");
    const signageId = c.req.param("signageId");
    try {
      await signageService.removeFavorite(user.id, signageId);
      return c.json({ success: true }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  },
});

export type SignageHandlers = ReturnType<typeof createSignageHandlers>;
