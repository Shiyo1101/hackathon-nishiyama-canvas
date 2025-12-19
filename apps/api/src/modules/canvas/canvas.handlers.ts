/**
 * Canvasハンドラーロジック
 *
 * ルート定義から分離して、テスタビリティと保守性を向上
 */
import type { Context } from "hono";
import type { Canvas } from "../../lib/db";
import type { AuthenticatedVariables } from "../auth";
import type { CanvasRepository } from "./canvas.repository";
import type { CanvasService } from "./canvas.service";

/**
 * レスポンスのシリアライズ
 */
const serializeCanvas = (canvas: Canvas | null) => {
  if (!canvas) return null;
  return {
    ...canvas,
    createdAt: canvas.createdAt.toISOString(),
    updatedAt: canvas.updatedAt.toISOString(),
    layoutConfig: canvas.layoutConfig,
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
export const createCanvasHandlers = (
  canvasService: CanvasService,
  canvasRepository: CanvasRepository,
) => ({
  /**
   * GET /canvases/me - 自分のキャンバスを取得
   */
  getUserCanvas: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const user = c.get("user");
    try {
      const canvas = await canvasService.getUserCanvas(user.id);
      if (!canvas) {
        return c.json({ success: false, error: "キャンバスが見つかりません" }, 404);
      }
      const serializedCanvas = serializeCanvas(canvas);
      if (!serializedCanvas) {
        return c.json({ success: false, error: "キャンバスのシリアライズに失敗しました" }, 500);
      }
      return c.json({ success: true, data: { canvas: serializedCanvas } }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * POST /canvases - キャンバスを作成
   */
  createCanvas: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const user = c.get("user");
    // biome-ignore lint/suspicious/noExplicitAny: Hono型推論の制限により必要
    const body = (c.req as any).valid("json") as Parameters<CanvasService["createCanvas"]>[1];
    try {
      const canvas = await canvasService.createCanvas(user.id, body);
      const serializedCanvas = serializeCanvas(canvas);
      if (!serializedCanvas) {
        throw new Error("Failed to serialize canvas");
      }
      return c.json({ success: true, data: { canvas: serializedCanvas } }, 201);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * PUT /canvases/:id - キャンバスを更新
   */
  updateCanvas: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const user = c.get("user");
    const id = c.req.param("id");
    // biome-ignore lint/suspicious/noExplicitAny: Hono型推論の制限により必要
    const body = (c.req as any).valid("json") as Parameters<CanvasService["updateCanvas"]>[2];
    try {
      const canvas = await canvasService.updateCanvas(user.id, id, body);
      const serializedCanvas = serializeCanvas(canvas);
      if (!serializedCanvas) {
        throw new Error("Failed to serialize canvas");
      }
      return c.json({ success: true, data: { canvas: serializedCanvas } }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * PATCH /canvases/:id/publish - キャンバスの公開状態を更新
   */
  updatePublishStatus: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const user = c.get("user");
    const id = c.req.param("id");
    // biome-ignore lint/suspicious/noExplicitAny: Hono型推論の制限により必要
    const { isPublic } = (c.req as any).valid("json") as { isPublic: boolean };
    try {
      const canvas = await canvasService.updatePublishStatus(user.id, id, isPublic);
      const serializedCanvas = serializeCanvas(canvas);
      if (!serializedCanvas) {
        throw new Error("Failed to serialize canvas");
      }
      return c.json({ success: true, data: { canvas: serializedCanvas } }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * DELETE /canvases/:id - キャンバスを削除
   */
  deleteCanvas: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const user = c.get("user");
    const id = c.req.param("id");
    try {
      await canvasService.deleteCanvas(user.id, id);
      return c.json({ success: true }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * GET /public/canvases/:slug - 公開キャンバスを取得
   */
  getPublicCanvas: async (c: Context) => {
    const slug = c.req.param("slug");
    try {
      const canvas = await canvasService.getPublicCanvas(slug);

      // 閲覧数のインクリメントをバックグラウンドで実行（レスポンスをブロックしない）
      // executionCtxがある場合（Cloudflare Workers等）はwaitUntilを使用
      // ない場合は単にPromiseを起動して待たない
      const incrementPromise = canvasRepository.incrementViewCount(canvas.id);
      if (c.executionCtx?.waitUntil) {
        c.executionCtx.waitUntil(incrementPromise);
      }

      const serializedCanvas = serializeCanvas(canvas);
      if (!serializedCanvas) {
        throw new Error("Failed to serialize canvas");
      }
      return c.json({ success: true, data: { canvas: serializedCanvas } }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * GET /public/canvases/popular - 人気の公開キャンバス一覧を取得
   */
  getPopularCanvases: async (c: Context) => {
    try {
      const limit = Number.parseInt(c.req.query("limit") ?? "10", 10);
      const canvases = await canvasService.getPopularCanvases(limit);
      const serializedCanvases = canvases
        .map((canvas) => serializeCanvas(canvas))
        .filter((s) => s !== null);
      return c.json({ success: true, data: { canvases: serializedCanvases } }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * GET /favorites - お気に入りキャンバス一覧を取得
   */
  getFavoriteCanvases: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const user = c.get("user");
    try {
      const limit = Number.parseInt(c.req.query("limit") ?? "10", 10);
      const canvases = await canvasService.getFavoriteCanvases(user.id, limit);
      const serializedCanvases = canvases
        .map((canvas) => serializeCanvas(canvas))
        .filter((s) => s !== null);
      return c.json({ success: true, data: { canvases: serializedCanvases } }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * POST /favorites/:canvasId - お気に入りに追加
   */
  addFavorite: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const user = c.get("user");
    const canvasId = c.req.param("canvasId");
    try {
      const result = await canvasService.addFavorite(user.id, canvasId);
      return c.json({ success: true, data: { favoriteId: result.id } }, 201);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * DELETE /favorites/:canvasId - お気に入りから削除
   */
  removeFavorite: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const user = c.get("user");
    const canvasId = c.req.param("canvasId");
    try {
      await canvasService.removeFavorite(user.id, canvasId);
      return c.json({ success: true }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  },
});

export type CanvasHandlers = ReturnType<typeof createCanvasHandlers>;
