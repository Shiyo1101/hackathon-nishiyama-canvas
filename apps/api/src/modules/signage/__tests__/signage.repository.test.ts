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

  describe("Favorite機能", () => {
    let anotherUserId: string;
    let testSignageId: string;

    beforeEach(async () => {
      // 別のユーザーを作成
      const anotherUser = await prisma.user.create({
        data: {
          email: `another-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
          name: "Another User",
          role: "user",
          emailVerified: true,
        },
      });
      anotherUserId = anotherUser.id;

      // テスト用サイネージ作成
      const signage = await prisma.signage.create({
        data: {
          userId: anotherUserId,
          title: "Test Signage for Favorites",
          slug: generateUniqueSlug("favorite-test"),
          layoutConfig: { template_id: "template-01", items: [] },
          isPublic: true,
          viewCount: 0,
          likeCount: 0,
        },
      });
      testSignageId = signage.id;

      // 既存のお気に入りを削除
      await prisma.favorite.deleteMany({
        where: { userId: testUserId },
      });
    });

    describe("addFavorite", () => {
      test("お気に入りを追加できる", async () => {
        // Act
        const result = await repository.addFavorite(testUserId, testSignageId);

        // Assert
        expect(result).toHaveProperty("id");
        expect(result.id).toBeDefined();

        // お気に入りが作成されていることを確認
        const favorite = await prisma.favorite.findUnique({
          where: {
            userId_signageId: {
              userId: testUserId,
              signageId: testSignageId,
            },
          },
        });
        expect(favorite).not.toBeNull();
        expect(favorite?.userId).toBe(testUserId);
        expect(favorite?.signageId).toBe(testSignageId);
      });

      test("お気に入り追加時にlikeCountがインクリメントされる", async () => {
        // Arrange
        const signageBefore = await prisma.signage.findUnique({
          where: { id: testSignageId },
        });
        const initialLikeCount = signageBefore?.likeCount ?? 0;

        // Act
        await repository.addFavorite(testUserId, testSignageId);

        // Assert
        const signageAfter = await prisma.signage.findUnique({
          where: { id: testSignageId },
        });
        expect(signageAfter?.likeCount).toBe(initialLikeCount + 1);
      });

      test("同じサイネージを2回お気に入り追加するとエラー", async () => {
        // Arrange
        await repository.addFavorite(testUserId, testSignageId);

        // Act & Assert
        await expect(repository.addFavorite(testUserId, testSignageId)).rejects.toThrow();
      });
    });

    describe("removeFavorite", () => {
      beforeEach(async () => {
        // お気に入りを追加
        await repository.addFavorite(testUserId, testSignageId);
      });

      test("お気に入りを削除できる", async () => {
        // Act
        await repository.removeFavorite(testUserId, testSignageId);

        // Assert
        const favorite = await prisma.favorite.findUnique({
          where: {
            userId_signageId: {
              userId: testUserId,
              signageId: testSignageId,
            },
          },
        });
        expect(favorite).toBeNull();
      });

      test("お気に入り削除時にlikeCountがデクリメントされる", async () => {
        // Arrange
        const signageBefore = await prisma.signage.findUnique({
          where: { id: testSignageId },
        });
        const initialLikeCount = signageBefore?.likeCount ?? 0;

        // Act
        await repository.removeFavorite(testUserId, testSignageId);

        // Assert
        const signageAfter = await prisma.signage.findUnique({
          where: { id: testSignageId },
        });
        expect(signageAfter?.likeCount).toBe(initialLikeCount - 1);
      });

      test("存在しないお気に入りを削除しようとするとエラー", async () => {
        // Arrange
        const nonExistentSignageId = "non-existent-id";

        // Act & Assert
        await expect(repository.removeFavorite(testUserId, nonExistentSignageId)).rejects.toThrow();
      });
    });

    describe("isFavorited", () => {
      test("お気に入り追加済みの場合trueを返す", async () => {
        // Arrange
        await repository.addFavorite(testUserId, testSignageId);

        // Act
        const result = await repository.isFavorited(testUserId, testSignageId);

        // Assert
        expect(result).toBe(true);
      });

      test("お気に入り未追加の場合falseを返す", async () => {
        // Act
        const result = await repository.isFavorited(testUserId, testSignageId);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe("findFavoritesByUserId", () => {
      test("ユーザーのお気に入りサイネージ一覧を取得できる", async () => {
        // Arrange
        // 2つのサイネージを作成してお気に入りに追加
        const signage1 = await prisma.signage.create({
          data: {
            userId: anotherUserId,
            title: "Favorite Signage 1",
            slug: generateUniqueSlug("fav-1"),
            layoutConfig: { template_id: "template-01", items: [] },
            isPublic: true,
          },
        });

        const signage2 = await prisma.signage.create({
          data: {
            userId: anotherUserId,
            title: "Favorite Signage 2",
            slug: generateUniqueSlug("fav-2"),
            layoutConfig: { template_id: "template-01", items: [] },
            isPublic: true,
          },
        });

        await repository.addFavorite(testUserId, signage1.id);
        await repository.addFavorite(testUserId, signage2.id);

        // Act
        const favorites = await repository.findFavoritesByUserId(testUserId);

        // Assert
        expect(favorites).toHaveLength(2);
        expect(favorites.map((s) => s.id)).toContain(signage1.id);
        expect(favorites.map((s) => s.id)).toContain(signage2.id);
      });

      test("お気に入りがない場合は空配列を返す", async () => {
        // Act
        const favorites = await repository.findFavoritesByUserId(testUserId);

        // Assert
        expect(favorites).toEqual([]);
      });

      test("limit パラメータで取得件数を制限できる", async () => {
        // Arrange
        // 3つのサイネージを作成してお気に入りに追加
        for (let i = 0; i < 3; i++) {
          const signage = await prisma.signage.create({
            data: {
              userId: anotherUserId,
              title: `Favorite Signage ${i}`,
              slug: generateUniqueSlug(`fav-${i}`),
              layoutConfig: { template_id: "template-01", items: [] },
              isPublic: true,
            },
          });
          await repository.addFavorite(testUserId, signage.id);
        }

        // Act
        const favorites = await repository.findFavoritesByUserId(testUserId, 2);

        // Assert
        expect(favorites).toHaveLength(2);
      });

      test("お気に入り一覧は作成日時の降順で返される", async () => {
        // Arrange
        const signage1 = await prisma.signage.create({
          data: {
            userId: anotherUserId,
            title: "First Favorite",
            slug: generateUniqueSlug("first-fav"),
            layoutConfig: { template_id: "template-01", items: [] },
            isPublic: true,
          },
        });
        await repository.addFavorite(testUserId, signage1.id);

        // 少し待ってから2つ目を追加
        await new Promise((resolve) => setTimeout(resolve, 10));

        const signage2 = await prisma.signage.create({
          data: {
            userId: anotherUserId,
            title: "Second Favorite",
            slug: generateUniqueSlug("second-fav"),
            layoutConfig: { template_id: "template-01", items: [] },
            isPublic: true,
          },
        });
        await repository.addFavorite(testUserId, signage2.id);

        // Act
        const favorites = await repository.findFavoritesByUserId(testUserId);

        // Assert
        expect(favorites).toHaveLength(2);
        expect(favorites[0].id).toBe(signage2.id); // 新しい方が先
        expect(favorites[1].id).toBe(signage1.id);
      });
    });
  });
});
