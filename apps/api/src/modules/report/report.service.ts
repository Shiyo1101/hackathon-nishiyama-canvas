import type { PrismaClient, Report } from "../../lib/db";
import type {
  Pagination,
  ReportFilter,
  ReportRepository,
  ReportWithDetailsResult,
} from "./report.repository";
import type { ReportReason, ReportStatus } from "./types";

/**
 * 通報作成入力（Service層）
 */
export type CreateReportInput = {
  canvasId: string;
  reason: ReportReason;
  description?: string;
};

/**
 * ReportService型定義
 */
export type ReportService = {
  createReport: (userId: string, input: CreateReportInput) => Promise<Report>;
  getReportById: (id: string) => Promise<ReportWithDetailsResult>;
  getReports: (
    filter: ReportFilter,
    pagination: Pagination,
  ) => Promise<{ reports: ReportWithDetailsResult[]; total: number }>;
  updateReportStatus: (id: string, status: ReportStatus, reviewedBy: string) => Promise<Report>;
};

/**
 * ReportServiceを作成
 */
export const createReportService = (
  repository: ReportRepository,
  prisma: PrismaClient,
): ReportService => ({
  createReport: async (userId: string, input: CreateReportInput): Promise<Report> => {
    // キャンバスの存在確認
    const canvas = await prisma.canvas.findUnique({
      where: { id: input.canvasId },
    });

    if (!canvas) {
      throw new Error("キャンバスが見つかりません");
    }

    // 重複通報チェック（同一ユーザー・同一キャンバス）
    const isDuplicate = await repository.existsByUserAndCanvas(userId, input.canvasId);

    if (isDuplicate) {
      throw new Error("すでにこのキャンバスを通報済みです");
    }

    // 通報を作成
    return repository.create({
      canvasId: input.canvasId,
      reporterUserId: userId,
      reason: input.reason,
      description: input.description,
    });
  },

  getReportById: async (id: string): Promise<ReportWithDetailsResult> => {
    const report = await repository.findByIdWithDetails(id);

    if (!report) {
      throw new Error("通報が見つかりません");
    }

    return report;
  },

  getReports: async (
    filter: ReportFilter,
    pagination: Pagination,
  ): Promise<{ reports: ReportWithDetailsResult[]; total: number }> => {
    const [reports, total] = await Promise.all([
      repository.findMany(filter, pagination),
      repository.count(filter),
    ]);

    return { reports, total };
  },

  updateReportStatus: async (
    id: string,
    status: ReportStatus,
    reviewedBy: string,
  ): Promise<Report> => {
    // 通報の存在確認
    const existingReport = await repository.findById(id);

    if (!existingReport) {
      throw new Error("通報が見つかりません");
    }

    // ステータス更新
    return repository.updateStatus(id, status, reviewedBy);
  },
});
