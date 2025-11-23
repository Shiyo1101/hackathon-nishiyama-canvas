/**
 * UserImageサービステスト
 */

import { beforeEach, describe, expect, test } from "vitest";
import { prisma } from "../../../lib/db";
import { ForbiddenError, NotFoundError } from "../../../lib/errors";
import { createUserImageRepository } from "../user-images.repository";
import type { UserImageService } from "../user-images.service";
import { createUserImageService } from "../user-images.service";

describe("UserImageService", () => {
  let service: UserImageService;
  let testUserId: string;
  let anotherUserId: string;

  beforeEach(async () => {
    const repository = createUserImageRepository(prisma);
    service = createUserImageService(repository);

    // テスト用ユーザー作成
    const user1 = await prisma.user.create({
      data: {
        email: `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
        name: "Test User 1",
        role: "user",
        emailVerified: true,
      },
    });
    testUserId = user1.id;

    const user2 = await prisma.user.create({
      data: {
        email: `test2-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
        name: "Test User 2",
        role: "user",
        emailVerified: true,
      },
    });
    anotherUserId = user2.id;

    // 既存の画像を削除
    await prisma.userImage.deleteMany({
      where: { userId: testUserId },
    });
  });

  describe("createUserImage", () => {
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
      const result = await service.createUserImage(imageData);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.userId).toBe(testUserId);
      expect(result.imageUrl).toBe(imageData.imageUrl);
    });
  });

  describe("getUserImageById", () => {
    test("自分の画像を取得できる", async () => {
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
      const result = await service.getUserImageById(userImage.id, testUserId);

      // Assert
      expect(result.id).toBe(userImage.id);
      expect(result.userId).toBe(testUserId);
    });

    test("存在しない画像を取得しようとするとNotFoundError", async () => {
      // Act & Assert
      await expect(service.getUserImageById("non-existent-id", testUserId)).rejects.toThrow(
        NotFoundError,
      );
      await expect(service.getUserImageById("non-existent-id", testUserId)).rejects.toThrow(
        "画像が見つかりません",
      );
    });

    test("他人の画像を取得しようとするとForbiddenError", async () => {
      // Arrange
      const userImage = await prisma.userImage.create({
        data: {
          userId: anotherUserId,
          imageUrl: "https://example.com/image.jpg",
          fileSize: 1024000,
          mimeType: "image/jpeg",
          usageType: "content",
        },
      });

      // Act & Assert
      await expect(service.getUserImageById(userImage.id, testUserId)).rejects.toThrow(
        ForbiddenError,
      );
      await expect(service.getUserImageById(userImage.id, testUserId)).rejects.toThrow(
        "この画像を閲覧する権限がありません",
      );
    });
  });

  describe("getUserImages", () => {
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

    test("ユーザーの画像一覧と総数を取得できる", async () => {
      // Act
      const result = await service.getUserImages(testUserId);

      // Assert
      expect(result.images).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.images.every((img) => img.userId === testUserId)).toBe(true);
    });

    test("usageTypeでフィルタリングできる", async () => {
      // Act
      const result = await service.getUserImages(testUserId, { usageType: "content" });

      // Assert
      expect(result.images).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.images.every((img) => img.usageType === "content")).toBe(true);
    });

    test("limitで取得件数を制限できる", async () => {
      // Act
      const result = await service.getUserImages(testUserId, { limit: 2 });

      // Assert
      expect(result.images).toHaveLength(2);
      expect(result.total).toBe(3);
    });

    test("offsetでスキップできる", async () => {
      // Act
      const result = await service.getUserImages(testUserId, { offset: 1 });

      // Assert
      expect(result.images).toHaveLength(2);
      expect(result.total).toBe(3);
    });

    test("画像がない場合は空配列と0を返す", async () => {
      // Act
      const result = await service.getUserImages(anotherUserId);

      // Assert
      expect(result.images).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("deleteUserImage", () => {
    test("自分の画像を削除できる", async () => {
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
      await service.deleteUserImage(userImage.id, testUserId);

      // Assert
      const deleted = await prisma.userImage.findUnique({
        where: { id: userImage.id },
      });
      expect(deleted).toBeNull();
    });

    test("存在しない画像を削除しようとするとNotFoundError", async () => {
      // Act & Assert
      await expect(service.deleteUserImage("non-existent-id", testUserId)).rejects.toThrow(
        NotFoundError,
      );
      await expect(service.deleteUserImage("non-existent-id", testUserId)).rejects.toThrow(
        "画像が見つかりません",
      );
    });

    test("他人の画像を削除しようとするとForbiddenError", async () => {
      // Arrange
      const userImage = await prisma.userImage.create({
        data: {
          userId: anotherUserId,
          imageUrl: "https://example.com/image.jpg",
          fileSize: 1024000,
          mimeType: "image/jpeg",
          usageType: "content",
        },
      });

      // Act & Assert
      await expect(service.deleteUserImage(userImage.id, testUserId)).rejects.toThrow(
        ForbiddenError,
      );
      await expect(service.deleteUserImage(userImage.id, testUserId)).rejects.toThrow(
        "この画像を削除する権限がありません",
      );
    });
  });
});
