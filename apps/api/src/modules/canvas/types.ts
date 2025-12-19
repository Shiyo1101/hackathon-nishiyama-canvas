/**
 * Canvas関連の型定義
 *
 * フロントエンド（apps/web）から @api でインポート可能
 */
import type { ApiResponse } from "../../types/api";

// LayoutConfig型はZodスキーマから生成されるため、canvas.routesからインポート
// 循環参照を避けるため、ここでは宣言のみ
// 実際の型定義は canvas.routes.ts の `export type LayoutConfig = z.infer<typeof LayoutConfigSchema>` を参照

/**
 * シリアライズされたCanvas型
 *
 * APIから返されるCanvasデータの型定義
 * PrismaのCanvas型をベースに、日付フィールドがISO文字列に変換されている
 */
export type SerializedCanvas = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  slug: string;
  layoutConfig: unknown; // JSONB型 - 実際はLayoutConfigだが、循環参照を避けるため一旦unknown
  isPublic: boolean;
  thumbnailUrl: string | null;
  viewCount: number;
  likeCount: number;
  createdAt: string; // ISO文字列
  updatedAt: string; // ISO文字列
};

/**
 * GET /canvases/me - 自分のキャンバスを取得
 */
export type GetUserCanvasResponse = ApiResponse<{ canvas: SerializedCanvas }>;

/**
 * POST /canvases - キャンバスを作成
 */
export type CreateCanvasResponse = ApiResponse<{ canvas: SerializedCanvas }>;

/**
 * PUT /canvases/:id - キャンバスを更新
 */
export type UpdateCanvasResponse = ApiResponse<{ canvas: SerializedCanvas }>;

/**
 * PATCH /canvases/:id/publish - キャンバスの公開状態を更新
 */
export type UpdatePublishStatusResponse = ApiResponse<{ canvas: SerializedCanvas }>;

/**
 * DELETE /canvases/:id - キャンバスを削除
 */
export type DeleteCanvasResponse = ApiResponse<Record<string, never>>;

/**
 * GET /public/canvases/:slug - 公開キャンバスを取得
 */
export type GetPublicCanvasResponse = ApiResponse<{ canvas: SerializedCanvas }>;

/**
 * GET /public/canvases/popular - 人気の公開キャンバス一覧を取得
 */
export type GetPopularCanvasesResponse = ApiResponse<{ canvases: SerializedCanvas[] }>;

/**
 * GET /favorites - お気に入りキャンバス一覧を取得
 */
export type GetFavoriteCanvasesResponse = ApiResponse<{ canvases: SerializedCanvas[] }>;

/**
 * POST /favorites/:canvasId - お気に入りに追加
 */
export type AddFavoriteResponse = ApiResponse<{ favoriteId: string }>;

/**
 * DELETE /favorites/:canvasId - お気に入りから削除
 */
export type RemoveFavoriteResponse = ApiResponse<Record<string, never>>;
