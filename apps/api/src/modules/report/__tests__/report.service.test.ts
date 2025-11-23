import { beforeEach, describe, expect, test } from "vitest";
import { prisma } from "../../../lib/db";
import { createReportRepository } from "../report.repository";
import { createReportService } from "../report.service";
import type { ReportReason } from "../types";

// ユニークなメールアドレスを生成するヘルパー関数
const generateUniqueEmail = (prefix: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix}-${timestamp}-${random}@example.com`;
};

// ユニークなslugを生成するヘルパー関数
const generateUniqueSlug = (prefix: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const processId = process.pid;
  return `${prefix}-${timestamp}-${random}-${processId}`;
};

describe("ReportService", () => {
  const repository = createReportRepository(prisma);
  const service = createReportService(repository, prisma);

  let testUserId: string;
  let testSignageId: string;

  beforeEach(async () => {
    // テストユーザーを作成
    const user = await prisma.user.create({
      data: {
        email: generateUniqueEmail("test"),
        name: "Test User",
      },
    });
    testUserId = user.id;

    // テストサイネージを作成（公開設定）
    const signage = await prisma.signage.create({
      data: {
        userId: testUserId,
        title: "Test Signage",
        slug: generateUniqueSlug("test-signage"),
        layoutConfig: {},
        isPublic: true, // 公開設定
      },
    });
    testSignageId = signage.id;
  });

  describe("createReport", () => {
    test("通報を作成できる", async () => {
      const input = {
        signageId: testSignageId,
        reason: "inappropriate_image" as ReportReason,
        description: "不適切な画像が含まれています",
      };

      const result = await service.createReport(testUserId, input);

      expect(result).toBeDefined();
      expect(result.signageId).toBe(testSignageId);
      expect(result.reporterUserId).toBe(testUserId);
      expect(result.reason).toBe(input.reason);
      expect(result.description).toBe(input.description);
      expect(result.status).toBe("pending");
    });

    test("サイネージが存在しない場合はエラー", async () => {
      const input = {
        signageId: "non-existent-id",
        reason: "spam" as ReportReason,
        description: "スパムです",
      };

      await expect(service.createReport(testUserId, input)).rejects.toThrow(
        "サイネージが見つかりません",
      );
    });

    test("重複通報の場合はエラー", async () => {
      const input = {
        signageId: testSignageId,
        reason: "inappropriate_image" as ReportReason,
        description: "不適切な画像が含まれています",
      };

      // 1回目の通報
      await service.createReport(testUserId, input);

      // 2回目の通報（同じユーザー・サイネージ）
      await expect(service.createReport(testUserId, input)).rejects.toThrow(
        "すでにこのサイネージを通報済みです",
      );
    });
  });

  describe("getReportById", () => {
    test("通報詳細を取得できる", async () => {
      const createdReport = await service.createReport(testUserId, {
        signageId: testSignageId,
        reason: "copyright" as ReportReason,
        description: "著作権侵害の疑い",
      });

      const result = await service.getReportById(createdReport.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(createdReport.id);
      expect(result.signage).toBeDefined();
      expect(result.signage.title).toBe("Test Signage");
      expect(result.reporterUser).toBeDefined();
    });

    test("存在しない通報の場合はエラー", async () => {
      await expect(service.getReportById("non-existent-id")).rejects.toThrow(
        "通報が見つかりません",
      );
    });
  });

  describe("getReports", () => {
    beforeEach(async () => {
      // 複数の通報を作成
      const user2 = await prisma.user.create({
        data: {
          email: generateUniqueEmail("test2"),
          name: "Test User 2",
        },
      });

      await service.createReport(testUserId, {
        signageId: testSignageId,
        reason: "inappropriate_image" as ReportReason,
      });

      await service.createReport(user2.id, {
        signageId: testSignageId,
        reason: "spam" as ReportReason,
      });
    });

    test("通報一覧を取得できる", async () => {
      const result = await service.getReports({}, { limit: 10, offset: 0 });

      expect(result.reports).toBeDefined();
      expect(result.reports.length).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeGreaterThanOrEqual(2);
    });

    test("ステータスでフィルタリングできる", async () => {
      const result = await service.getReports({ status: "pending" }, { limit: 10, offset: 0 });

      expect(result.reports).toBeDefined();
      expect(result.reports.length).toBeGreaterThanOrEqual(2);
      for (const report of result.reports) {
        expect(report.status).toBe("pending");
      }
    });

    test("ページネーションが正しく動作する", async () => {
      const result = await service.getReports({}, { limit: 1, offset: 0 });

      expect(result.reports.length).toBe(1);
      expect(result.total).toBeGreaterThanOrEqual(2);
    });
  });

  describe("updateReportStatus", () => {
    let adminUserId: string;
    let testReportId: string;

    beforeEach(async () => {
      const admin = await prisma.user.create({
        data: {
          email: generateUniqueEmail("admin"),
          name: "Admin User",
          role: "admin",
        },
      });
      adminUserId = admin.id;

      const report = await service.createReport(testUserId, {
        signageId: testSignageId,
        reason: "inappropriate_image" as ReportReason,
      });
      testReportId = report.id;
    });

    test("通報ステータスを更新できる", async () => {
      const result = await service.updateReportStatus(testReportId, "resolved", adminUserId);

      expect(result).toBeDefined();
      expect(result.id).toBe(testReportId);
      expect(result.status).toBe("resolved");
      expect(result.reviewedBy).toBe(adminUserId);
      expect(result.reviewedAt).toBeDefined();
    });

    test("存在しない通報の場合はエラー", async () => {
      await expect(
        service.updateReportStatus("non-existent-id", "resolved", adminUserId),
      ).rejects.toThrow("通報が見つかりません");
    });
  });
});
