/**
 * Report関連の型定義
 *
 * フロントエンド（apps/web）から @api でインポート可能
 */
import type { ReportReason, ReportStatus } from "../../lib/db";
import type { ApiResponse } from "../../types/api";

/**
 * 通報理由と通報ステータスはPrismaスキーマのenumを使用
 * Prismaから自動生成される型をそのまま使用してre-export
 */
export type { ReportReason, ReportStatus };

/**
 * シリアライズされたReport型
 *
 * APIから返されるReportデータの型定義
 * PrismaのReport型をベースに、日付フィールドがISO文字列に変換されている
 */
export type SerializedReport = {
  id: string;
  canvasId: string;
  reporterUserId: string;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  reviewedBy: string | null;
  reviewedAt: string | null; // ISO文字列
  createdAt: string; // ISO文字列
  updatedAt: string; // ISO文字列
};

/**
 * 詳細情報を含むReport型（管理者用）
 */
export type ReportWithDetails = SerializedReport & {
  canvas: {
    id: string;
    title: string;
    slug: string;
    user: {
      id: string;
      name: string;
    };
  };
  reporter: {
    id: string;
    name: string;
  };
};

/**
 * POST /reports - 通報を作成
 */
export type CreateReportResponse = ApiResponse<{ report: SerializedReport }>;

/**
 * GET /reports/:id - 通報詳細を取得（管理者のみ）
 */
export type GetReportResponse = ApiResponse<{ report: ReportWithDetails }>;

/**
 * GET /admin/reports - 通報一覧を取得（管理者のみ）
 */
export type GetReportsResponse = ApiResponse<{
  reports: ReportWithDetails[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}>;

/**
 * PATCH /admin/reports/:id - 通報ステータスを更新（管理者のみ）
 */
export type UpdateReportStatusResponse = ApiResponse<{ report: SerializedReport }>;
