/**
 * Reportルート定義
 *
 * ミドルウェアを適用せず、型推論を最適化
 * ハンドラーロジックは report.handlers.ts に分離
 */
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import type { AuthenticatedVariables } from "../auth";
import { authMiddleware, requireAdmin, requireAuth } from "../auth";
import type { ReportHandlers } from "./report.handlers";

/**
 * Zodスキーマ定義
 */
export const CreateReportRequestSchema = z.object({
  canvasId: z.string().min(1, "キャンバスIDは必須です"),
  reason: z.enum(["inappropriate_image", "spam", "copyright", "other"], {
    errorMap: () => ({
      message:
        "通報理由は inappropriate_image, spam, copyright, other のいずれかである必要があります",
    }),
  }),
  description: z.string().min(1).max(1000).optional(),
});

export const UpdateReportStatusRequestSchema = z.object({
  status: z.enum(["pending", "reviewed", "resolved", "rejected"], {
    errorMap: () => ({
      message: "ステータスは pending, reviewed, resolved, rejected のいずれかである必要があります",
    }),
  }),
});

/**
 * 型定義（Zodスキーマから推論）
 */
export type CreateReportInput = z.infer<typeof CreateReportRequestSchema>;
export type UpdateReportStatusInput = z.infer<typeof UpdateReportStatusRequestSchema>;

/**
 * 通報ルート定義ファクトリー（一般ユーザー向け）
 *
 * POST /reports - 通報を作成
 */
export const createReportRoutes = (handlers: ReportHandlers) => {
  return new Hono<{ Variables: AuthenticatedVariables }>().post(
    "/",
    authMiddleware,
    requireAuth,
    zValidator("json", CreateReportRequestSchema),
    handlers.createReport,
  );
};

/**
 * 管理者向け通報ルート定義ファクトリー
 *
 * GET /admin/reports - 通報一覧を取得
 * GET /admin/reports/:id - 通報詳細を取得
 * PATCH /admin/reports/:id - 通報ステータスを更新
 */
export const createAdminReportRoutes = (handlers: ReportHandlers) => {
  return new Hono<{ Variables: AuthenticatedVariables }>()
    .get("/", authMiddleware, requireAuth, requireAdmin, handlers.getReports)
    .get("/:id", authMiddleware, requireAuth, requireAdmin, handlers.getReportById)
    .patch(
      "/:id",
      authMiddleware,
      requireAuth,
      requireAdmin,
      zValidator("json", UpdateReportStatusRequestSchema),
      handlers.updateReportStatus,
    );
};
