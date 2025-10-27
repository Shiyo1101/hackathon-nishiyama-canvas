/**
 * サイネージService テスト
 */

import { beforeEach, describe, expect, test } from "vitest";
import { prisma } from "../../../lib/db";
import type { CreateSignageInput } from "../../../types";
import { createSignageRepository } from "../signage.repository";
import type { SignageService } from "../signage.service";
import { createSignageService } from "../signage.service";

// ユニークなslugを生成するヘルパー関数
const generateUniqueSlug = (prefix: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const processId = process.pid;
  return `${prefix}-${timestamp}-${random}-${processId}`;
};

describe("SignageService", () => {
  let service: SignageService;
  let testUserId: string;

  beforeEach(async () => {
    const repository = createSignageRepository(prisma);
    service = createSignageService(repository);

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

    // 既存のサイネージを削除（UNIQUE制約対策）
    await prisma.signage.deleteMany({ where: { userId: testUserId } });
  });

  describe("getUserSignage", () => {
    test("ユーザーのサイネージを取得できる", async () => {
      // Arrange
      const signage = await prisma.signage.create({
        data: {
          userId: testUserId,
          title: "Test Signage",
          slug: generateUniqueSlug("test-signage"),
          layoutConfig: { template_id: "template-01", items: [] },
        },
      });

      // Act
      const result = await service.getUserSignage(testUserId);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe(signage.id);
    });

    test("サイネージが存在しない場合はnullを返す", async () => {
      // Act
      const result = await service.getUserSignage(testUserId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("createSignage", () => {
    test("サイネージを作成できる", async () => {
      // Arrange
      const input: CreateSignageInput = {
        title: "New Signage",
        slug: generateUniqueSlug("new-signage"),
        description: "Test description",
        layoutConfig: {
          template_id: "template-01",
          background: { type: "color", color: "#ffffff" },
          items: [],
        },
      };

      // Act
      const result = await service.createSignage(testUserId, input);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.userId).toBe(testUserId);
      expect(result.title).toBe(input.title);
    });

    test("すでにサイネージが存在する場合はエラー", async () => {
      // Arrange: 既存サイネージ作成
      await prisma.signage.create({
        data: {
          userId: testUserId,
          title: "Existing Signage",
          slug: generateUniqueSlug("existing-signage"),
          layoutConfig: { template_id: "template-01", items: [] },
        },
      });

      const input: CreateSignageInput = {
        title: "New Signage",
        slug: generateUniqueSlug("new-signage"),
        layoutConfig: {
          template_id: "template-01",
          background: { type: "color" },
          items: [],
        },
      };

      // Act & Assert
      await expect(service.createSignage(testUserId, input)).rejects.toThrow(
        "すでにサイネージが存在します",
      );
    });

    test("スラッグが重複している場合はエラー", async () => {
      // Arrange: 別ユーザーで同じスラッグのサイネージ作成
      const anotherUser = await prisma.user.create({
        data: {
          email: `another-${Date.now()}@example.com`,
          name: "Another User",
          role: "user",
          emailVerified: true,
        },
      });

      const slug = generateUniqueSlug("duplicate-slug");
      await prisma.signage.create({
        data: {
          userId: anotherUser.id,
          title: "Existing Signage",
          slug,
          layoutConfig: { template_id: "template-01", items: [] },
        },
      });

      const input: CreateSignageInput = {
        title: "New Signage",
        slug,
        layoutConfig: {
          template_id: "template-01",
          background: { type: "color" },
          items: [],
        },
      };

      // Act & Assert
      await expect(service.createSignage(testUserId, input)).rejects.toThrow(
        "このスラッグは既に使用されています",
      );
    });
  });

  describe("updateSignage", () => {
    test("サイネージを更新できる", async () => {
      // Arrange
      const signage = await prisma.signage.create({
        data: {
          userId: testUserId,
          title: "Original Title",
          slug: generateUniqueSlug("test-signage"),
          layoutConfig: { template_id: "template-01", items: [] },
        },
      });

      // Act
      const result = await service.updateSignage(testUserId, signage.id, {
        title: "Updated Title",
      });

      // Assert
      expect(result.title).toBe("Updated Title");
    });

    test("存在しないサイネージを更新しようとするとエラー", async () => {
      // Act & Assert
      await expect(
        service.updateSignage(testUserId, "non-existent-id", {
          title: "Updated Title",
        }),
      ).rejects.toThrow("サイネージが見つかりません");
    });

    test("他人のサイネージを更新しようとするとエラー", async () => {
      // Arrange
      const anotherUser = await prisma.user.create({
        data: {
          email: `another-${Date.now()}@example.com`,
          name: "Another User",
          role: "user",
          emailVerified: true,
        },
      });

      const signage = await prisma.signage.create({
        data: {
          userId: anotherUser.id,
          title: "Original Title",
          slug: generateUniqueSlug("test-signage"),
          layoutConfig: { template_id: "template-01", items: [] },
        },
      });

      // Act & Assert
      await expect(
        service.updateSignage(testUserId, signage.id, {
          title: "Updated Title",
        }),
      ).rejects.toThrow("このサイネージを操作する権限がありません");
    });
  });

  describe("updatePublishStatus", () => {
    test("公開ステータスを更新できる", async () => {
      // Arrange
      const signage = await prisma.signage.create({
        data: {
          userId: testUserId,
          title: "Test Signage",
          slug: generateUniqueSlug("test-signage"),
          layoutConfig: { template_id: "template-01", items: [] },
          isPublic: false,
        },
      });

      // Act
      const result = await service.updatePublishStatus(testUserId, signage.id, true);

      // Assert
      expect(result.isPublic).toBe(true);
    });

    test("他人のサイネージの公開ステータスを更新しようとするとエラー", async () => {
      // Arrange
      const anotherUser = await prisma.user.create({
        data: {
          email: `another-${Date.now()}@example.com`,
          name: "Another User",
          role: "user",
          emailVerified: true,
        },
      });

      const signage = await prisma.signage.create({
        data: {
          userId: anotherUser.id,
          title: "Test Signage",
          slug: generateUniqueSlug("test-signage"),
          layoutConfig: { template_id: "template-01", items: [] },
        },
      });

      // Act & Assert
      await expect(service.updatePublishStatus(testUserId, signage.id, true)).rejects.toThrow(
        "このサイネージを操作する権限がありません",
      );
    });
  });

  describe("deleteSignage", () => {
    test("サイネージを削除できる", async () => {
      // Arrange
      const signage = await prisma.signage.create({
        data: {
          userId: testUserId,
          title: "Test Signage",
          slug: generateUniqueSlug("test-signage"),
          layoutConfig: { template_id: "template-01", items: [] },
        },
      });

      // Act
      await service.deleteSignage(testUserId, signage.id);

      // Assert
      const deleted = await prisma.signage.findUnique({
        where: { id: signage.id },
      });
      expect(deleted).toBeNull();
    });

    test("他人のサイネージを削除しようとするとエラー", async () => {
      // Arrange
      const anotherUser = await prisma.user.create({
        data: {
          email: `another-${Date.now()}@example.com`,
          name: "Another User",
          role: "user",
          emailVerified: true,
        },
      });

      const signage = await prisma.signage.create({
        data: {
          userId: anotherUser.id,
          title: "Test Signage",
          slug: generateUniqueSlug("test-signage"),
          layoutConfig: { template_id: "template-01", items: [] },
        },
      });

      // Act & Assert
      await expect(service.deleteSignage(testUserId, signage.id)).rejects.toThrow(
        "このサイネージを操作する権限がありません",
      );
    });
  });

  describe("getPublicSignage", () => {
    test("公開サイネージを取得して閲覧数をインクリメントできる", async () => {
      // Arrange
      const slug = generateUniqueSlug("public-signage");
      await prisma.signage.create({
        data: {
          userId: testUserId,
          title: "Public Signage",
          slug,
          layoutConfig: { template_id: "template-01", items: [] },
          isPublic: true,
          viewCount: 0,
        },
      });

      // Act
      const result = await service.getPublicSignage(slug);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.slug).toBe(slug);

      // 閲覧数がインクリメントされているか確認
      const updated = await prisma.signage.findUnique({
        where: { slug },
      });
      expect(updated?.viewCount).toBe(1);
    });

    test("非公開サイネージは取得できない", async () => {
      // Arrange
      const slug = generateUniqueSlug("private-signage");
      await prisma.signage.create({
        data: {
          userId: testUserId,
          title: "Private Signage",
          slug,
          layoutConfig: { template_id: "template-01", items: [] },
          isPublic: false,
        },
      });

      // Act & Assert
      await expect(service.getPublicSignage(slug)).rejects.toThrow("サイネージが見つかりません");
    });
  });
});
