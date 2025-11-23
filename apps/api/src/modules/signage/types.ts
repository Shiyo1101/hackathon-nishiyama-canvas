/**
 * Signage関連の型定義
 *
 * フロントエンド（apps/web）から @api でインポート可能
 */
import type { ApiResponse } from "../../types/api";

// LayoutConfig型はZodスキーマから生成されるため、signage.routesからインポート
// 循環参照を避けるため、ここでは宣言のみ
// 実際の型定義は signage.routes.ts の `export type LayoutConfig = z.infer<typeof LayoutConfigSchema>` を参照

/**
 * シリアライズされたSignage型
 *
 * APIから返されるSignageデータの型定義
 * PrismaのSignage型をベースに、日付フィールドがISO文字列に変換されている
 */
export type SerializedSignage = {
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
 * GET /signages/me - 自分のサイネージを取得
 */
export type GetUserSignageResponse = ApiResponse<{ signage: SerializedSignage }>;

/**
 * POST /signages - サイネージを作成
 */
export type CreateSignageResponse = ApiResponse<{ signage: SerializedSignage }>;

/**
 * PUT /signages/:id - サイネージを更新
 */
export type UpdateSignageResponse = ApiResponse<{ signage: SerializedSignage }>;

/**
 * PATCH /signages/:id/publish - サイネージの公開状態を更新
 */
export type UpdatePublishStatusResponse = ApiResponse<{ signage: SerializedSignage }>;

/**
 * DELETE /signages/:id - サイネージを削除
 */
export type DeleteSignageResponse = ApiResponse<Record<string, never>>;

/**
 * GET /public/signages/:slug - 公開サイネージを取得
 */
export type GetPublicSignageResponse = ApiResponse<{ signage: SerializedSignage }>;

/**
 * GET /public/signages/popular - 人気の公開サイネージ一覧を取得
 */
export type GetPopularSignagesResponse = ApiResponse<{ signages: SerializedSignage[] }>;

/**
 * GET /favorites - お気に入りサイネージ一覧を取得
 */
export type GetFavoriteSignagesResponse = ApiResponse<{ signages: SerializedSignage[] }>;

/**
 * POST /favorites/:signageId - お気に入りに追加
 */
export type AddFavoriteResponse = ApiResponse<{ favoriteId: string }>;

/**
 * DELETE /favorites/:signageId - お気に入りから削除
 */
export type RemoveFavoriteResponse = ApiResponse<Record<string, never>>;
