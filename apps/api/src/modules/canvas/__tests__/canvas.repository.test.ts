/**
 * キャンバスRepository テスト
 */

import { beforeEach, describe, expect, test } from "vitest";
import { prisma } from "../../../lib/db";

import type { CanvasRepository } from "../canvas.repository";
import { createCanvasRepository } from "../canvas.repository";
import type { CreateCanvasInput } from "../canvas.routes";

// ユニークなslugを生成するヘルパー関数
const generateUniqueSlug = (prefix: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const processId = process.pid;
  return `${prefix}-${timestamp}-${random}-${processId}`;
};

describe("CanvasRepository", () => {
  let repository: CanvasRepository;
  let testUserId: string;

  beforeEach(async () => {
    repository = createCanvasRepository(prisma);

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
    test("ユーザーのキャンバスを取得できる", async () => {
      // Arrange: テストデータ作成
      const canvas = await prisma.canvas.create({
        data: {
          userId: testUserId,
          title: "Test Canvas",
          slug: generateUniqueSlug("test-canvas"),
          layoutConfig: { template_id: "template-01", items: [] },
        },
      });

      // Act
      const result = await repository.findByUserId(testUserId);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe(canvas.id);
      expect(result?.title).toBe("Test Canvas");
    });

    test("キャンバスが存在しない場合はnullを返す", async () => {
      // Act
      const result = await repository.findByUserId(testUserId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findBySlug", () => {
    test("スラッグでキャンバスを取得できる", async () => {
      // Arrange
      const slug = generateUniqueSlug("test-slug");
      await prisma.canvas.create({
        data: {
          userId: testUserId,
          title: "Test Canvas",
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
      const result = await repository.update(canvas.id, {
        title: "Updated Title",
        description: "Updated description",
      });

      // Assert
      expect(result.title).toBe("Updated Title");
      expect(result.description).toBe("Updated description");
    });

    test("サムネイルURLを更新できる", async () => {
      // Arrange
      const canvas = await prisma.canvas.create({
        data: {
          userId: testUserId,
          title: "Test Canvas",
          slug: generateUniqueSlug("test-canvas"),
          layoutConfig: { template_id: "template-01", items: [] },
          thumbnailUrl: null,
        },
      });

      const newThumbnailUrl = "https://example.com/thumbnail.jpg";

      // Act
      const result = await repository.update(canvas.id, {
        thumbnailUrl: newThumbnailUrl,
      });

      // Assert
      expect(result.thumbnailUrl).toBe(newThumbnailUrl);
    });

    test("サムネイルURLをnullに更新できる", async () => {
      // Arrange
      const canvas = await prisma.canvas.create({
        data: {
          userId: testUserId,
          title: "Test Canvas",
          slug: generateUniqueSlug("test-canvas"),
          layoutConfig: { template_id: "template-01", items: [] },
          thumbnailUrl: "https://example.com/old-thumbnail.jpg",
        },
      });

      // Act
      const result = await repository.update(canvas.id, {
        thumbnailUrl: null,
      });

      // Assert
      expect(result.thumbnailUrl).toBeNull();
    });

    test("公開設定を更新できる", async () => {
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
      const result = await repository.update(canvas.id, {
        isPublic: true,
      });

      // Assert
      expect(result.isPublic).toBe(true);
    });

    test("複数のフィールドを同時に更新できる", async () => {
      // Arrange
      const canvas = await prisma.canvas.create({
        data: {
          userId: testUserId,
          title: "Original Title",
          slug: generateUniqueSlug("test-canvas"),
          layoutConfig: { template_id: "template-01", items: [] },
          thumbnailUrl: null,
          isPublic: false,
        },
      });

      // Act
      const result = await repository.update(canvas.id, {
        title: "Updated Title",
        description: "New description",
        thumbnailUrl: "https://example.com/new-thumbnail.jpg",
        isPublic: true,
      });

      // Assert
      expect(result.title).toBe("Updated Title");
      expect(result.description).toBe("New description");
      expect(result.thumbnailUrl).toBe("https://example.com/new-thumbnail.jpg");
      expect(result.isPublic).toBe(true);
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
      const result = await repository.updatePublishStatus(canvas.id, true);

      // Assert
      expect(result.isPublic).toBe(true);
    });
  });

  describe("delete", () => {
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
      await repository.delete(canvas.id);

      // Assert
      const deleted = await prisma.canvas.findUnique({
        where: { id: canvas.id },
      });
      expect(deleted).toBeNull();
    });
  });

  describe("incrementViewCount", () => {
    test("閲覧数をインクリメントできる", async () => {
      // Arrange
      const canvas = await prisma.canvas.create({
        data: {
          userId: testUserId,
          title: "Test Canvas",
          slug: generateUniqueSlug("test-canvas"),
          layoutConfig: { template_id: "template-01", items: [] },
          viewCount: 0,
        },
      });

      // Act
      await repository.incrementViewCount(canvas.id);

      // Assert
      const updated = await prisma.canvas.findUnique({
        where: { id: canvas.id },
      });
      expect(updated?.viewCount).toBe(1);
    });
  });

  describe("Favorite機能", () => {
    let anotherUserId: string;
    let testCanvasId: string;

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

      // テスト用キャンバス作成
      const canvas = await prisma.canvas.create({
        data: {
          userId: anotherUserId,
          title: "Test Canvas for Favorites",
          slug: generateUniqueSlug("favorite-test"),
          layoutConfig: { template_id: "template-01", items: [] },
          isPublic: true,
          viewCount: 0,
          likeCount: 0,
        },
      });
      testCanvasId = canvas.id;

      // 既存のお気に入りを削除
      await prisma.favorite.deleteMany({
        where: { userId: testUserId },
      });
    });

    describe("addFavorite", () => {
      test("お気に入りを追加できる", async () => {
        // Act
        const result = await repository.addFavorite(testUserId, testCanvasId);

        // Assert
        expect(result).toHaveProperty("id");
        expect(result.id).toBeDefined();

        // お気に入りが作成されていることを確認
        const favorite = await prisma.favorite.findUnique({
          where: {
            userId_canvasId: {
              userId: testUserId,
              canvasId: testCanvasId,
            },
          },
        });
        expect(favorite).not.toBeNull();
        expect(favorite?.userId).toBe(testUserId);
        expect(favorite?.canvasId).toBe(testCanvasId);
      });

      test("お気に入り追加時にlikeCountがインクリメントされる", async () => {
        // Arrange
        const canvasBefore = await prisma.canvas.findUnique({
          where: { id: testCanvasId },
        });
        const initialLikeCount = canvasBefore?.likeCount ?? 0;

        // Act
        await repository.addFavorite(testUserId, testCanvasId);

        // Assert
        const canvasAfter = await prisma.canvas.findUnique({
          where: { id: testCanvasId },
        });
        expect(canvasAfter?.likeCount).toBe(initialLikeCount + 1);
      });

      test("同じキャンバスを2回お気に入り追加するとエラー", async () => {
        // Arrange
        await repository.addFavorite(testUserId, testCanvasId);

        // Act & Assert
        await expect(repository.addFavorite(testUserId, testCanvasId)).rejects.toThrow();
      });
    });

    describe("removeFavorite", () => {
      beforeEach(async () => {
        // お気に入りを追加
        await repository.addFavorite(testUserId, testCanvasId);
      });

      test("お気に入りを削除できる", async () => {
        // Act
        await repository.removeFavorite(testUserId, testCanvasId);

        // Assert
        const favorite = await prisma.favorite.findUnique({
          where: {
            userId_canvasId: {
              userId: testUserId,
              canvasId: testCanvasId,
            },
          },
        });
        expect(favorite).toBeNull();
      });

      test("お気に入り削除時にlikeCountがデクリメントされる", async () => {
        // Arrange
        const canvasBefore = await prisma.canvas.findUnique({
          where: { id: testCanvasId },
        });
        const initialLikeCount = canvasBefore?.likeCount ?? 0;

        // Act
        await repository.removeFavorite(testUserId, testCanvasId);

        // Assert
        const canvasAfter = await prisma.canvas.findUnique({
          where: { id: testCanvasId },
        });
        expect(canvasAfter?.likeCount).toBe(initialLikeCount - 1);
      });

      test("存在しないお気に入りを削除しようとするとエラー", async () => {
        // Arrange
        const nonExistentCanvasId = "non-existent-id";

        // Act & Assert
        await expect(repository.removeFavorite(testUserId, nonExistentCanvasId)).rejects.toThrow();
      });
    });

    describe("isFavorited", () => {
      test("お気に入り追加済みの場合trueを返す", async () => {
        // Arrange
        await repository.addFavorite(testUserId, testCanvasId);

        // Act
        const result = await repository.isFavorited(testUserId, testCanvasId);

        // Assert
        expect(result).toBe(true);
      });

      test("お気に入り未追加の場合falseを返す", async () => {
        // Act
        const result = await repository.isFavorited(testUserId, testCanvasId);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe("findFavoritesByUserId", () => {
      test("ユーザーのお気に入りキャンバス一覧を取得できる", async () => {
        // Arrange
        // 2つのキャンバスを作成してお気に入りに追加
        const canvas1 = await prisma.canvas.create({
          data: {
            userId: anotherUserId,
            title: "Favorite Canvas 1",
            slug: generateUniqueSlug("fav-1"),
            layoutConfig: { template_id: "template-01", items: [] },
            isPublic: true,
          },
        });

        const canvas2 = await prisma.canvas.create({
          data: {
            userId: anotherUserId,
            title: "Favorite Canvas 2",
            slug: generateUniqueSlug("fav-2"),
            layoutConfig: { template_id: "template-01", items: [] },
            isPublic: true,
          },
        });

        await repository.addFavorite(testUserId, canvas1.id);
        await repository.addFavorite(testUserId, canvas2.id);

        // Act
        const favorites = await repository.findFavoritesByUserId(testUserId);

        // Assert
        expect(favorites).toHaveLength(2);
        expect(favorites.map((s) => s.id)).toContain(canvas1.id);
        expect(favorites.map((s) => s.id)).toContain(canvas2.id);
      });

      test("お気に入りがない場合は空配列を返す", async () => {
        // Act
        const favorites = await repository.findFavoritesByUserId(testUserId);

        // Assert
        expect(favorites).toEqual([]);
      });

      test("limit パラメータで取得件数を制限できる", async () => {
        // Arrange
        // 3つのキャンバスを作成してお気に入りに追加
        for (let i = 0; i < 3; i++) {
          const canvas = await prisma.canvas.create({
            data: {
              userId: anotherUserId,
              title: `Favorite Canvas ${i}`,
              slug: generateUniqueSlug(`fav-${i}`),
              layoutConfig: { template_id: "template-01", items: [] },
              isPublic: true,
            },
          });
          await repository.addFavorite(testUserId, canvas.id);
        }

        // Act
        const favorites = await repository.findFavoritesByUserId(testUserId, 2);

        // Assert
        expect(favorites).toHaveLength(2);
      });

      test("お気に入り一覧は作成日時の降順で返される", async () => {
        // Arrange
        const canvas1 = await prisma.canvas.create({
          data: {
            userId: anotherUserId,
            title: "First Favorite",
            slug: generateUniqueSlug("first-fav"),
            layoutConfig: { template_id: "template-01", items: [] },
            isPublic: true,
          },
        });
        await repository.addFavorite(testUserId, canvas1.id);

        // 少し待ってから2つ目を追加
        await new Promise((resolve) => setTimeout(resolve, 10));

        const canvas2 = await prisma.canvas.create({
          data: {
            userId: anotherUserId,
            title: "Second Favorite",
            slug: generateUniqueSlug("second-fav"),
            layoutConfig: { template_id: "template-01", items: [] },
            isPublic: true,
          },
        });
        await repository.addFavorite(testUserId, canvas2.id);

        // Act
        const favorites = await repository.findFavoritesByUserId(testUserId);

        // Assert
        expect(favorites).toHaveLength(2);
        expect(favorites[0].id).toBe(canvas2.id); // 新しい方が先
        expect(favorites[1].id).toBe(canvas1.id);
      });
    });
  });
});
