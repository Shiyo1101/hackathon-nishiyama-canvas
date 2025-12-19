import { beforeEach, describe, expect, test } from "vitest";
import { prisma } from "../../../lib/db";
import { createReportRepository } from "../report.repository";
import type { ReportReason, ReportStatus } from "../types";

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

describe("ReportRepository", () => {
  const repository = createReportRepository(prisma);

  let testUserId: string;
  let testCanvasId: string;
  let testReportId: string;

  beforeEach(async () => {
    // テストユーザーを作成
    const user = await prisma.user.create({
      data: {
        email: generateUniqueEmail("test"),
        name: "Test User",
      },
    });
    testUserId = user.id;

    // テストキャンバスを作成
    const canvas = await prisma.canvas.create({
      data: {
        userId: testUserId,
        title: "Test Canvas",
        slug: generateUniqueSlug("test-canvas"),
        layoutConfig: {},
      },
    });
    testCanvasId = canvas.id;
  });

  describe("create", () => {
    test("通報を作成できる", async () => {
      const input = {
        canvasId: testCanvasId,
        reporterUserId: testUserId,
        reason: "inappropriate_image" as ReportReason,
        description: "不適切な画像が含まれています",
      };

      const result = await repository.create(input);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.canvasId).toBe(input.canvasId);
      expect(result.reporterUserId).toBe(input.reporterUserId);
      expect(result.reason).toBe(input.reason);
      expect(result.description).toBe(input.description);
      expect(result.status).toBe("pending");
      expect(result.reviewedBy).toBeNull();
      expect(result.reviewedAt).toBeNull();
    });

    test("descriptionなしで通報を作成できる", async () => {
      const input = {
        canvasId: testCanvasId,
        reporterUserId: testUserId,
        reason: "spam" as ReportReason,
      };

      const result = await repository.create(input);

      expect(result).toBeDefined();
      expect(result.description).toBeNull();
    });
  });

  describe("findById", () => {
    beforeEach(async () => {
      const report = await repository.create({
        canvasId: testCanvasId,
        reporterUserId: testUserId,
        reason: "inappropriate_image" as ReportReason,
        description: "テスト通報",
      });
      testReportId = report.id;
    });

    test("IDで通報を取得できる", async () => {
      const result = await repository.findById(testReportId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(testReportId);
      expect(result?.canvasId).toBe(testCanvasId);
    });

    test("存在しないIDの場合はnullを返す", async () => {
      const result = await repository.findById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("findByIdWithDetails", () => {
    beforeEach(async () => {
      const report = await repository.create({
        canvasId: testCanvasId,
        reporterUserId: testUserId,
        reason: "copyright" as ReportReason,
        description: "著作権侵害の疑い",
      });
      testReportId = report.id;
    });

    test("詳細情報を含む通報を取得できる", async () => {
      const result = await repository.findByIdWithDetails(testReportId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(testReportId);
      expect(result?.canvas).toBeDefined();
      expect(result?.canvas.title).toBe("Test Canvas");
      expect(result?.canvas.user).toBeDefined();
      expect(result?.canvas.user.name).toBe("Test User");
      expect(result?.reporterUser).toBeDefined();
      expect(result?.reporterUser.name).toBe("Test User");
    });

    test("存在しないIDの場合はnullを返す", async () => {
      const result = await repository.findByIdWithDetails("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("findMany", () => {
    beforeEach(async () => {
      // 複数の通報を作成
      await repository.create({
        canvasId: testCanvasId,
        reporterUserId: testUserId,
        reason: "inappropriate_image" as ReportReason,
      });
      await repository.create({
        canvasId: testCanvasId,
        reporterUserId: testUserId,
        reason: "spam" as ReportReason,
      });
    });

    test("通報一覧を取得できる", async () => {
      const result = await repository.findMany({}, { limit: 10, offset: 0 });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    test("ステータスでフィルタリングできる", async () => {
      const result = await repository.findMany(
        { status: "pending" as ReportStatus },
        { limit: 10, offset: 0 },
      );

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThanOrEqual(2);
      for (const report of result) {
        expect(report.status).toBe("pending");
      }
    });

    test("canvasIdでフィルタリングできる", async () => {
      const result = await repository.findMany(
        { canvasId: testCanvasId },
        { limit: 10, offset: 0 },
      );

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThanOrEqual(2);
      for (const report of result) {
        expect(report.canvasId).toBe(testCanvasId);
      }
    });

    test("limitとoffsetで範囲指定できる", async () => {
      const result = await repository.findMany({}, { limit: 1, offset: 0 });

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });
  });

  describe("count", () => {
    beforeEach(async () => {
      await repository.create({
        canvasId: testCanvasId,
        reporterUserId: testUserId,
        reason: "inappropriate_image" as ReportReason,
      });
      await repository.create({
        canvasId: testCanvasId,
        reporterUserId: testUserId,
        reason: "spam" as ReportReason,
      });
    });

    test("通報件数をカウントできる", async () => {
      const result = await repository.count({});

      expect(result).toBeGreaterThanOrEqual(2);
    });

    test("ステータスでフィルタリングしてカウントできる", async () => {
      const result = await repository.count({ status: "pending" as ReportStatus });

      expect(result).toBeGreaterThanOrEqual(2);
    });
  });

  describe("updateStatus", () => {
    let adminUserId: string;

    beforeEach(async () => {
      const admin = await prisma.user.create({
        data: {
          email: generateUniqueEmail("admin"),
          name: "Admin User",
          role: "admin",
        },
      });
      adminUserId = admin.id;

      const report = await repository.create({
        canvasId: testCanvasId,
        reporterUserId: testUserId,
        reason: "inappropriate_image" as ReportReason,
      });
      testReportId = report.id;
    });

    test("通報ステータスを更新できる", async () => {
      const result = await repository.updateStatus(
        testReportId,
        "resolved" as ReportStatus,
        adminUserId,
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(testReportId);
      expect(result.status).toBe("resolved");
      expect(result.reviewedBy).toBe(adminUserId);
      expect(result.reviewedAt).toBeDefined();
    });
  });

  describe("existsByUserAndCanvas", () => {
    test("同一ユーザー・キャンバスの通報が存在する場合trueを返す", async () => {
      await repository.create({
        canvasId: testCanvasId,
        reporterUserId: testUserId,
        reason: "inappropriate_image" as ReportReason,
      });

      const result = await repository.existsByUserAndCanvas(testUserId, testCanvasId);

      expect(result).toBe(true);
    });

    test("同一ユーザー・キャンバスの通報が存在しない場合falseを返す", async () => {
      const result = await repository.existsByUserAndCanvas(testUserId, testCanvasId);

      expect(result).toBe(false);
    });
  });
});
