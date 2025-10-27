/**
 * サイネージRepository テスト
 */

import { beforeEach, describe, expect, test } from "vitest";
import { prisma } from "../../../lib/db";
import type { CreateSignageInput } from "../../../types";
import type { SignageRepository } from "../signage.repository";
import { createSignageRepository } from "../signage.repository";

// ユニークなslugを生成するヘルパー関数
const generateUniqueSlug = (prefix: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const processId = process.pid;
  return `${prefix}-${timestamp}-${random}-${processId}`;
};

describe("SignageRepository", () => {
  let repository: SignageRepository;
  let testUserId: string;

  beforeEach(async () => {
    repository = createSignageRepository(prisma);

    // テスト用ユーザー作成
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: "Test User",
        role: "user",
        emailVerified: true,
      },
    });
    testUserId = user.id;
  });

  describe("findByUserId", () => {
    test("ユーザーのサイネージを取得できる", async () => {
      // Arrange: テストデータ作成
      const signage = await prisma.signage.create({
        data: {
          userId: testUserId,
          title: "Test Signage",
          slug: generateUniqueSlug("test-signage"),
          layoutConfig: { template_id: "template-01", items: [] },
        },
      });

      // Act
      const result = await repository.findByUserId(testUserId);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe(signage.id);
      expect(result?.title).toBe("Test Signage");
    });

    test("サイネージが存在しない場合はnullを返す", async () => {
      // Act
      const result = await repository.findByUserId(testUserId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findBySlug", () => {
    test("スラッグでサイネージを取得できる", async () => {
      // Arrange
      const slug = generateUniqueSlug("test-slug");
      await prisma.signage.create({
        data: {
          userId: testUserId,
          title: "Test Signage",
          slug,
          layoutConfig: { template_id: "template-01", items: [] },
        },
      });

      // Act
      const result = await repository.findBySlug(slug);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.slug).toBe(slug);
    });

    test("スラッグが存在しない場合はnullを返す", async () => {
      // Act
      const result = await repository.findBySlug("non-existent-slug");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
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
      const result = await repository.create(testUserId, input);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.userId).toBe(testUserId);
      expect(result.title).toBe(input.title);
      expect(result.slug).toBe(input.slug);
      expect(result.description).toBe(input.description ?? null);
      expect(result.isPublic).toBe(false);
      expect(result.viewCount).toBe(0);
    });
  });

  describe("update", () => {
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
      const result = await repository.update(signage.id, {
        title: "Updated Title",
        description: "Updated description",
      });

      // Assert
      expect(result.title).toBe("Updated Title");
      expect(result.description).toBe("Updated description");
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
      const result = await repository.updatePublishStatus(signage.id, true);

      // Assert
      expect(result.isPublic).toBe(true);
    });
  });

  describe("delete", () => {
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
      await repository.delete(signage.id);

      // Assert
      const deleted = await prisma.signage.findUnique({
        where: { id: signage.id },
      });
      expect(deleted).toBeNull();
    });
  });

  describe("incrementViewCount", () => {
    test("閲覧数をインクリメントできる", async () => {
      // Arrange
      const signage = await prisma.signage.create({
        data: {
          userId: testUserId,
          title: "Test Signage",
          slug: generateUniqueSlug("test-signage"),
          layoutConfig: { template_id: "template-01", items: [] },
          viewCount: 0,
        },
      });

      // Act
      await repository.incrementViewCount(signage.id);

      // Assert
      const updated = await prisma.signage.findUnique({
        where: { id: signage.id },
      });
      expect(updated?.viewCount).toBe(1);
    });
  });
});
