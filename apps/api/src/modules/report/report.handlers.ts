/**
 * Reportハンドラーロジック
 *
 * ルート定義から分離して、テスタビリティと保守性を向上
 */
import type { Context } from "hono";
import type { Report } from "../../lib/db";
import type { AuthenticatedVariables } from "../auth";
import type { ReportWithDetailsResult } from "./report.repository";
import type { ReportService } from "./report.service";

/**
 * Reportのシリアライズ
 */
const serializeReport = (report: Report) => {
  return {
    ...report,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
    reviewedAt: report.reviewedAt?.toISOString() ?? null,
  };
};

/**
 * 詳細情報を含むReportのシリアライズ
 */
const serializeReportWithDetails = (report: ReportWithDetailsResult) => {
  return {
    ...report,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
    reviewedAt: report.reviewedAt?.toISOString() ?? null,
    canvas: {
      id: report.canvas.id,
      title: report.canvas.title,
      slug: report.canvas.slug,
      user: {
        id: report.canvas.user.id,
        name: report.canvas.user.name ?? "Unknown User",
      },
    },
    reporter: {
      id: report.reporterUser.id,
      name: report.reporterUser.name ?? "Unknown User",
    },
  };
};

/**
 * エラーハンドリング
 */
const handleError = (error: unknown, c: Context) => {
  console.error("Report handler error:", error);
  if (error instanceof Error) {
    console.error("Error stack:", error.stack);
    if (error.message.includes("見つかりません")) {
      return c.json({ success: false, error: error.message }, 404);
    }
    if (error.message.includes("通報済み")) {
      return c.json({ success: false, error: error.message }, 409);
    }
    return c.json({ success: false, error: error.message }, 400);
  }
  return c.json({ success: false, error: "Unknown error" }, 500);
};

/**
 * ハンドラー型定義
 */
export type ReportHandlers = ReturnType<typeof createReportHandlers>;

/**
 * ハンドラーファクトリー
 */
export const createReportHandlers = (reportService: ReportService) => ({
  /**
   * POST /reports - 通報を作成
   */
  createReport: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const user = c.get("user");
    // biome-ignore lint/suspicious/noExplicitAny: Hono型推論の制限により必要
    const body = (c.req as any).valid("json") as Parameters<ReportService["createReport"]>[1];

    try {
      const report = await reportService.createReport(user.id, body);
      const serializedReport = serializeReport(report);
      return c.json({ success: true, data: { report: serializedReport } }, 201);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * GET /admin/reports/:id - 通報詳細を取得（管理者のみ）
   */
  getReportById: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const id = c.req.param("id");

    try {
      const report = await reportService.getReportById(id);
      const serializedReport = serializeReportWithDetails(report);
      return c.json({ success: true, data: { report: serializedReport } }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * GET /admin/reports - 通報一覧を取得（管理者のみ）
   */
  getReports: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const status = c.req.query("status");
    const canvasId = c.req.query("canvasId");
    const limit = Number.parseInt(c.req.query("limit") ?? "20", 10);
    const offset = Number.parseInt(c.req.query("offset") ?? "0", 10);

    try {
      const filter = {
        ...(status && { status: status as "pending" | "reviewed" | "resolved" | "rejected" }),
        ...(canvasId && { canvasId }),
      };

      const result = await reportService.getReports(filter, { limit, offset });

      const serializedReports = result.reports.map(serializeReportWithDetails);

      return c.json(
        {
          success: true,
          data: {
            reports: serializedReports,
            pagination: {
              total: result.total,
              limit,
              offset,
            },
          },
        },
        200,
      );
    } catch (error) {
      return handleError(error, c);
    }
  },

  /**
   * PATCH /admin/reports/:id - 通報ステータスを更新（管理者のみ）
   */
  updateReportStatus: async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    const user = c.get("user");
    const id = c.req.param("id");
    // biome-ignore lint/suspicious/noExplicitAny: Hono型推論の制限により必要
    const body = (c.req as any).valid("json") as {
      status: "pending" | "reviewed" | "resolved" | "rejected";
    };

    try {
      const report = await reportService.updateReportStatus(id, body.status, user.id);
      const serializedReport = serializeReport(report);
      return c.json({ success: true, data: { report: serializedReport } }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  },
});
