/**
 * キャンバスService テスト
 */

import { beforeEach, describe, expect, test } from "vitest";
import { prisma } from "../../../lib/db";
import type { CreateCanvasInput } from "../../../types";
import { createCanvasRepository } from "../canvas.repository";
import type { CanvasService } from "../canvas.service";
import { createCanvasService } from "../canvas.service";

// ユニークなslugを生成するヘルパー関数
const generateUniqueSlug = (prefix: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const processId = process.pid;
  return `${prefix}-${timestamp}-${random}-${processId}`;
};

describe("CanvasService", () => {
  let service: CanvasService;
  let testUserId: string;

  beforeEach(async () => {
    const repository = createCanvasRepository(prisma);
    service = createCanvasService(repository);

    // テスト用ユーザー作成
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
        name: "Test User",
        role: "user",
        emailVerified: true,
      },
    });
    testUserId = user.id;

    // 既存のキャンバスを削除（UNIQUE制約対策）
    await prisma.canvas.deleteMany({ where: { userId: testUserId } });
  });

  describe("getUserCanvas", () => {
    test("ユーザーのキャンバスを取得できる", async () => {
      // Arrange
      const canvas = await prisma.canvas.create({
        data: {
          userId: testUserId,
          title: "Test Canvas",
          slug: generateUniqueSlug("test-canvas"),
          layoutConfig: { template_id: "template-01", items: [] },
        },
      });

      // Act
      const result = await service.getUserCanvas(testUserId);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe(canvas.id);
    });

    test("キャンバスが存在しない場合はnullを返す", async () => {
      // Act
      const result = await service.getUserCanvas(testUserId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("createCanvas", () => {
    test("キャンバスを作成できる", async () => {
      // Arrange
      const input: CreateCanvasInput = {
        title: "New Canvas",
        slug: generateUniqueSlug("new-canvas"),
        description: "Test description",
        layoutConfig: {
          template_id: "template-01",
          background: { type: "color", color: "#ffffff" },
          items: [],
        },
      };

      // Act
      const result = await service.createCanvas(testUserId, input);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.userId).toBe(testUserId);
      expect(result.title).toBe(input.title);
    });

    test("すでにキャンバスが存在する場合はエラー", async () => {
      // Arrange: 既存キャンバス作成
      await prisma.canvas.create({
        data: {
          userId: testUserId,
          title: "Existing Canvas",
          slug: generateUniqueSlug("existing-canvas"),
          layoutConfig: { template_id: "template-01", items: [] },
        },
      });

      const input: CreateCanvasInput = {
        title: "New Canvas",
        slug: generateUniqueSlug("new-canvas"),
        layoutConfig: {
          template_id: "template-01",
          background: { type: "color" },
          items: [],
        },
      };

      // Act & Assert
      await expect(service.createCanvas(testUserId, input)).rejects.toThrow(
        "無料プランでは1つまでキャンバスを作成できます",
      );
    });

    test("スラッグが重複している場合はエラー", async () => {
      // Arrange: 別ユーザーで同じスラッグのキャンバス作成
      const anotherUser = await prisma.user.create({
        data: {
          email: `another-${Date.now()}@example.com`,
          name: "Another User",
          role: "user",
          emailVerified: true,
        },
      });

      const slug = generateUniqueSlug("duplicate-slug");
      await prisma.canvas.create({
        data: {
          userId: anotherUser.id,
          title: "Existing Canvas",
          slug,
          layoutConfig: { template_id: "template-01", items: [] },
        },
      });

      const input: CreateCanvasInput = {
        title: "New Canvas",
        slug,
        layoutConfig: {
          template_id: "template-01",
          background: { type: "color" },
          items: [],
        },
      };

      // Act & Assert
      await expect(service.createCanvas(testUserId, input)).rejects.toThrow(
        "このスラッグは既に使用されています",
      );
    });
  });

  describe("updateCanvas", () => {
    test("キャンバスを更新できる", async () => {
      // Arrange
      const canvas = await prisma.canvas.create({
        data: {
          userId: testUserId,
          title: "Original Title",
          slug: generateUniqueSlug("test-canvas"),
          layoutConfig: { template_id: "template-01", items: [] },
        },
      });

      // Act
      const result = await service.updateCanvas(testUserId, canvas.id, {
        title: "Updated Title",
      });

      // Assert
      expect(result.title).toBe("Updated Title");
    });

    test("存在しないキャンバスを更新しようとするとエラー", async () => {
      // Act & Assert
      await expect(
        service.updateCanvas(testUserId, "non-existent-id", {
          title: "Updated Title",
        }),
      ).rejects.toThrow("キャンバスが見つかりません");
    });

    test("他人のキャンバスを更新しようとするとエラー", async () => {
      // Arrange
      const anotherUser = await prisma.user.create({
        data: {
          email: `another-${Date.now()}@example.com`,
          name: "Another User",
          role: "user",
          emailVerified: true,
        },
      });

      const canvas = await prisma.canvas.create({
        data: {
          userId: anotherUser.id,
          title: "Original Title",
          slug: generateUniqueSlug("test-canvas"),
          layoutConfig: { template_id: "template-01", items: [] },
        },
      });

      // Act & Assert
      await expect(
        service.updateCanvas(testUserId, canvas.id, {
          title: "Updated Title",
        }),
      ).rejects.toThrow("このキャンバスを操作する権限がありません");
    });
  });

  describe("updatePublishStatus", () => {
    test("公開ステータスを更新できる", async () => {
      // Arrange
      const canvas = await prisma.canvas.create({
        data: {
          userId: testUserId,
          title: "Test Canvas",
          slug: generateUniqueSlug("test-canvas"),
          layoutConfig: { template_id: "template-01", items: [] },
          isPublic: false,
        },
      });

      // Act
      const result = await service.updatePublishStatus(testUserId, canvas.id, true);

      // Assert
      expect(result.isPublic).toBe(true);
    });

    test("他人のキャンバスの公開ステータスを更新しようとするとエラー", async () => {
      // Arrange
      const anotherUser = await prisma.user.create({
        data: {
          email: `another-${Date.now()}@example.com`,
          name: "Another User",
          role: "user",
          emailVerified: true,
        },
      });

      const canvas = await prisma.canvas.create({
        data: {
          userId: anotherUser.id,
          title: "Test Canvas",
          slug: generateUniqueSlug("test-canvas"),
          layoutConfig: { template_id: "template-01", items: [] },
        },
      });

      // Act & Assert
      await expect(service.updatePublishStatus(testUserId, canvas.id, true)).rejects.toThrow(
        "このキャンバスを操作する権限がありません",
      );
    });
  });

  describe("deleteCanvas", () => {
    test("キャンバスを削除できる", async () => {
      // Arrange
      const canvas = await prisma.canvas.create({
        data: {
          userId: testUserId,
          title: "Test Canvas",
          slug: generateUniqueSlug("test-canvas"),
          layoutConfig: { template_id: "template-01", items: [] },
        },
      });

      // Act
      await service.deleteCanvas(testUserId, canvas.id);

      // Assert
      const deleted = await prisma.canvas.findUnique({
        where: { id: canvas.id },
      });
      expect(deleted).toBeNull();
    });

    test("他人のキャンバスを削除しようとするとエラー", async () => {
      // Arrange
      const anotherUser = await prisma.user.create({
        data: {
          email: `another-${Date.now()}@example.com`,
          name: "Another User",
          role: "user",
          emailVerified: true,
        },
      });

      const canvas = await prisma.canvas.create({
        data: {
          userId: anotherUser.id,
          title: "Test Canvas",
          slug: generateUniqueSlug("test-canvas"),
          layoutConfig: { template_id: "template-01", items: [] },
        },
      });

      // Act & Assert
      await expect(service.deleteCanvas(testUserId, canvas.id)).rejects.toThrow(
        "このキャンバスを操作する権限がありません",
      );
    });
  });

  describe("getPublicCanvas", () => {
    test("公開キャンバスを取得できる", async () => {
      // Arrange
      const slug = generateUniqueSlug("public-canvas");
      await prisma.canvas.create({
        data: {
          userId: testUserId,
          title: "Public Canvas",
          slug,
          layoutConfig: { template_id: "template-01", items: [] },
          isPublic: true,
          viewCount: 0,
        },
      });

      // Act
      const result = await service.getPublicCanvas(slug);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.slug).toBe(slug);
      expect(result?.isPublic).toBe(true);

      // Note: 閲覧数のインクリメントはハンドラー層でバックグラウンド実行されるため、
      // サービス層のテストでは検証しない
    });

    test("非公開キャンバスは取得できない", async () => {
      // Arrange
      const slug = generateUniqueSlug("private-canvas");
      await prisma.canvas.create({
        data: {
          userId: testUserId,
          title: "Private Canvas",
          slug,
          layoutConfig: { template_id: "template-01", items: [] },
          isPublic: false,
        },
      });

      // Act & Assert
      await expect(service.getPublicCanvas(slug)).rejects.toThrow("キャンバスが見つかりません");
    });
  });
});
