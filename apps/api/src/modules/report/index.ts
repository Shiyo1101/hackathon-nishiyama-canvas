/**
 * Report モジュールのエクスポート
 */

export type { ReportHandlers } from "./report.handlers";
export { createReportHandlers } from "./report.handlers";
export type {
  CreateReportInput as CreateReportRepositoryInput,
  Pagination,
  ReportFilter,
  ReportRepository,
  ReportWithDetailsResult,
} from "./report.repository";
export { createReportRepository } from "./report.repository";
export type {
  CreateReportInput as CreateReportRouteInput,
  UpdateReportStatusInput,
} from "./report.routes";
export { createAdminReportRoutes, createReportRoutes } from "./report.routes";
export type {
  CreateReportInput,
  ReportService,
} from "./report.service";
export { createReportService } from "./report.service";

export type {
  CreateReportResponse,
  GetReportResponse,
  GetReportsResponse,
  ReportReason,
  ReportStatus,
  ReportWithDetails,
  SerializedReport,
  UpdateReportStatusResponse,
} from "./types";
