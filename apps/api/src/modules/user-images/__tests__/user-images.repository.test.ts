/**
 * UserImageリポジトリテスト
 */

import { beforeEach, describe, expect, test } from "vitest";
import { prisma } from "../../../lib/db";
import type { UserImageRepository } from "../user-images.repository";
import { createUserImageRepository } from "../user-images.repository";

describe("UserImageRepository", () => {
  let repository: UserImageRepository;
  let testUserId: string;

  beforeEach(async () => {
    repository = createUserImageRepository(prisma);

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

    // 既存の画像を削除
    await prisma.userImage.deleteMany({
      where: { userId: testUserId },
    });
  });

  describe("create", () => {
    test("ユーザー画像を作成できる", async () => {
      // Arrange
      const imageData = {
        userId: testUserId,
        imageUrl: "https://example.com/image.jpg",
        thumbnailUrl: "https://example.com/thumb.jpg",
        fileSize: 1024000,
        mimeType: "image/jpeg",
        usageType: "content" as const,
      };

      // Act
      const result = await repository.create(imageData);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.userId).toBe(testUserId);
      expect(result.imageUrl).toBe(imageData.imageUrl);
      expect(result.thumbnailUrl).toBe(imageData.thumbnailUrl);
      expect(result.fileSize).toBe(imageData.fileSize);
      expect(result.mimeType).toBe(imageData.mimeType);
      expect(result.usageType).toBe(imageData.usageType);
    });

    test("thumbnailUrlなしで画像を作成できる", async () => {
      // Arrange
      const imageData = {
        userId: testUserId,
        imageUrl: "https://example.com/image.jpg",
        fileSize: 1024000,
        mimeType: "image/jpeg",
        usageType: "content" as const,
      };

      // Act
      const result = await repository.create(imageData);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.thumbnailUrl).toBeNull();
    });
  });

  describe("findById", () => {
    test("IDで画像を取得できる", async () => {
      // Arrange
      const userImage = await prisma.userImage.create({
        data: {
          userId: testUserId,
          imageUrl: "https://example.com/image.jpg",
          fileSize: 1024000,
          mimeType: "image/jpeg",
          usageType: "content",
        },
      });

      // Act
      const result = await repository.findById(userImage.id);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe(userImage.id);
      expect(result?.imageUrl).toBe(userImage.imageUrl);
    });

    test("存在しないIDの場合はnullを返す", async () => {
      // Act
      const result = await repository.findById("non-existent-id");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findByUserId", () => {
    beforeEach(async () => {
      // テストデータ作成
      await prisma.userImage.createMany({
        data: [
          {
            userId: testUserId,
            imageUrl: "https://example.com/image1.jpg",
            fileSize: 1024000,
            mimeType: "image/jpeg",
            usageType: "content",
          },
          {
            userId: testUserId,
            imageUrl: "https://example.com/image2.jpg",
            fileSize: 2048000,
            mimeType: "image/jpeg",
            usageType: "content",
          },
          {
            userId: testUserId,
            imageUrl: "https://example.com/image3.jpg",
            fileSize: 512000,
            mimeType: "image/png",
            usageType: "background",
          },
        ],
      });
    });

    test("ユーザーIDで画像一覧を取得できる", async () => {
      // Act
      const result = await repository.findByUserId(testUserId);

      // Assert
      expect(result).toHaveLength(3);
      expect(result.every((img) => img.userId === testUserId)).toBe(true);
    });

    test("usageTypeでフィルタリングできる", async () => {
      // Act
      const result = await repository.findByUserId(testUserId, { usageType: "content" });

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every((img) => img.usageType === "content")).toBe(true);
    });

    test("limitで取得件数を制限できる", async () => {
      // Act
      const result = await repository.findByUserId(testUserId, { limit: 2 });

      // Assert
      expect(result).toHaveLength(2);
    });

    test("offsetでスキップできる", async () => {
      // Act
      const allImages = await repository.findByUserId(testUserId);
      const offsetImages = await repository.findByUserId(testUserId, { offset: 1 });

      // Assert
      expect(offsetImages).toHaveLength(2);
      expect(offsetImages[0].id).toBe(allImages[1].id);
    });

    test("作成日時の降順で取得される", async () => {
      // Act
      const result = await repository.findByUserId(testUserId);

      // Assert
      expect(result).toHaveLength(3);
      for (let i = 1; i < result.length; i++) {
        const current = new Date(result[i].createdAt);
        const previous = new Date(result[i - 1].createdAt);
        expect(current.getTime()).toBeLessThanOrEqual(previous.getTime());
      }
    });

    test("画像がない場合は空配列を返す", async () => {
      // Arrange
      const anotherUser = await prisma.user.create({
        data: {
          email: `another-${Date.now()}@example.com`,
          name: "Another User",
          role: "user",
          emailVerified: true,
        },
      });

      // Act
      const result = await repository.findByUserId(anotherUser.id);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("delete", () => {
    test("画像を削除できる", async () => {
      // Arrange
      const userImage = await prisma.userImage.create({
        data: {
          userId: testUserId,
          imageUrl: "https://example.com/image.jpg",
          fileSize: 1024000,
          mimeType: "image/jpeg",
          usageType: "content",
        },
      });

      // Act
      await repository.delete(userImage.id);

      // Assert
      const deleted = await prisma.userImage.findUnique({
        where: { id: userImage.id },
      });
      expect(deleted).toBeNull();
    });

    test("存在しないIDを削除しようとするとエラー", async () => {
      // Act & Assert
      await expect(repository.delete("non-existent-id")).rejects.toThrow();
    });
  });

  describe("countByUserId", () => {
    beforeEach(async () => {
      // テストデータ作成
      await prisma.userImage.createMany({
        data: [
          {
            userId: testUserId,
            imageUrl: "https://example.com/image1.jpg",
            fileSize: 1024000,
            mimeType: "image/jpeg",
            usageType: "content",
          },
          {
            userId: testUserId,
            imageUrl: "https://example.com/image2.jpg",
            fileSize: 2048000,
            mimeType: "image/jpeg",
            usageType: "content",
          },
          {
            userId: testUserId,
            imageUrl: "https://example.com/image3.jpg",
            fileSize: 512000,
            mimeType: "image/png",
            usageType: "background",
          },
        ],
      });
    });

    test("ユーザーの画像総数を取得できる", async () => {
      // Act
      const result = await repository.countByUserId(testUserId);

      // Assert
      expect(result).toBe(3);
    });

    test("usageTypeでフィルタリングして総数を取得できる", async () => {
      // Act
      const result = await repository.countByUserId(testUserId, "content");

      // Assert
      expect(result).toBe(2);
    });

    test("画像がない場合は0を返す", async () => {
      // Arrange
      const anotherUser = await prisma.user.create({
        data: {
          email: `another-${Date.now()}@example.com`,
          name: "Another User",
          role: "user",
          emailVerified: true,
        },
      });

      // Act
      const result = await repository.countByUserId(anotherUser.id);

      // Assert
      expect(result).toBe(0);
    });
  });
});
