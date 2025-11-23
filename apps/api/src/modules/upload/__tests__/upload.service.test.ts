/**
 * UploadServiceテスト
 */

import { beforeEach, describe, expect, test, vi } from "vitest";
import type { UploadResult } from "../../../lib/s3";
import * as s3 from "../../../lib/s3";
import type { UploadService } from "../upload.service";
import { createUploadService } from "../upload.service";

// S3関数をモック
vi.mock("../../../lib/s3", () => ({
  uploadImage: vi.fn(),
  deleteImage: vi.fn(),
}));

describe("UploadService", () => {
  let service: UploadService;
  const mockUploadImage = vi.mocked(s3.uploadImage);
  const mockDeleteImage = vi.mocked(s3.deleteImage);

  beforeEach(() => {
    service = createUploadService();
    vi.clearAllMocks();
  });

  describe("uploadContentImage", () => {
    test("画像を正常にアップロードできる", async () => {
      // Arrange
      const mockBuffer = Buffer.from("test image data");
      const fileName = "test-image.jpg";
      const userId = "test-user-id";

      const mockUploadResult: UploadResult = {
        key: "users/test-user-id/1234567890.jpg",
        bucket: "nishiyama-canvas-images",
        region: "ap-northeast-1",
        url: "http://localhost:4566/nishiyama-canvas-images/users/test-user-id/1234567890.jpg",
        etag: "test-etag",
        size: 123456,
      };

      mockUploadImage.mockResolvedValueOnce(mockUploadResult);

      // Act
      const result = await service.uploadContentImage(mockBuffer, fileName, userId);

      // Assert
      expect(mockUploadImage).toHaveBeenCalledWith(mockBuffer, {
        folder: `users/${userId}`,
        fileName: expect.stringMatching(/^\d+\.jpg$/),
        contentType: "image/jpg",
        metadata: {
          userId,
          originalFileName: fileName,
          uploadedAt: expect.any(String),
        },
      });

      expect(result).toEqual({
        url: mockUploadResult.url,
        secureUrl: mockUploadResult.url,
        publicId: mockUploadResult.key,
        width: 0,
        height: 0,
        format: "jpg",
        bytes: mockUploadResult.size,
      });
    });

    test("ファイル名から拡張子を取得してS3キーを生成する", async () => {
      // Arrange
      const mockBuffer = Buffer.from("test image data");
      const fileName = "my-photo.png";
      const userId = "test-user-id";

      const mockUploadResult: UploadResult = {
        key: "users/test-user-id/1234567890.png",
        bucket: "nishiyama-canvas-images",
        region: "ap-northeast-1",
        url: "http://localhost:4566/nishiyama-canvas-images/users/test-user-id/1234567890.png",
        etag: "test-etag",
        size: 50000,
      };

      mockUploadImage.mockResolvedValueOnce(mockUploadResult);

      // Act
      await service.uploadContentImage(mockBuffer, fileName, userId);

      // Assert
      expect(mockUploadImage).toHaveBeenCalledWith(
        mockBuffer,
        expect.objectContaining({
          fileName: expect.stringMatching(/^\d+\.png$/),
          contentType: "image/png",
        }),
      );
    });

    test("S3のアップロードが失敗した場合エラーをスローする", async () => {
      // Arrange
      const mockBuffer = Buffer.from("test image data");
      const fileName = "test-image.jpg";
      const userId = "test-user-id";

      mockUploadImage.mockRejectedValueOnce(new Error("S3 upload failed"));

      // Act & Assert
      await expect(service.uploadContentImage(mockBuffer, fileName, userId)).rejects.toThrow(
        "画像のアップロードに失敗しました",
      );
    });

    test("複数の画像を連続してアップロードできる", async () => {
      // Arrange
      const mockBuffer1 = Buffer.from("image 1");
      const mockBuffer2 = Buffer.from("image 2");
      const userId = "test-user-id";

      const mockUploadResult1: UploadResult = {
        key: "users/test-user-id/1234567890.jpg",
        bucket: "nishiyama-canvas-images",
        region: "ap-northeast-1",
        url: "http://localhost:4566/nishiyama-canvas-images/users/test-user-id/1234567890.jpg",
        etag: "etag1",
        size: 100000,
      };

      const mockUploadResult2: UploadResult = {
        key: "users/test-user-id/1234567891.jpg",
        bucket: "nishiyama-canvas-images",
        region: "ap-northeast-1",
        url: "http://localhost:4566/nishiyama-canvas-images/users/test-user-id/1234567891.jpg",
        etag: "etag2",
        size: 50000,
      };

      mockUploadImage
        .mockResolvedValueOnce(mockUploadResult1)
        .mockResolvedValueOnce(mockUploadResult2);

      // Act
      const result1 = await service.uploadContentImage(mockBuffer1, "image1.jpg", userId);
      const result2 = await service.uploadContentImage(mockBuffer2, "image2.jpg", userId);

      // Assert
      expect(mockUploadImage).toHaveBeenCalledTimes(2);
      expect(result1.publicId).toBe(mockUploadResult1.key);
      expect(result2.publicId).toBe(mockUploadResult2.key);
    });
  });

  describe("deleteContentImage", () => {
    test("画像を正常に削除できる", async () => {
      // Arrange
      const key = "users/test-user-id/1234567890.jpg";

      mockDeleteImage.mockResolvedValueOnce({ result: "ok" });

      // Act
      await service.deleteContentImage(key);

      // Assert
      expect(mockDeleteImage).toHaveBeenCalledWith(key);
    });

    test("S3の削除が失敗した場合エラーをスローする", async () => {
      // Arrange
      const key = "users/test-user-id/test.jpg";

      mockDeleteImage.mockResolvedValueOnce({ result: "not found" });

      // Act & Assert
      await expect(service.deleteContentImage(key)).rejects.toThrow("画像の削除に失敗しました");
    });

    test("S3でエラーが発生した場合エラーをスローする", async () => {
      // Arrange
      const key = "users/test-user-id/test.jpg";

      mockDeleteImage.mockRejectedValueOnce(new Error("S3 error"));

      // Act & Assert
      await expect(service.deleteContentImage(key)).rejects.toThrow("画像の削除に失敗しました");
    });

    test("複数の画像を連続して削除できる", async () => {
      // Arrange
      const key1 = "users/test-user-id/image1.jpg";
      const key2 = "users/test-user-id/image2.jpg";

      mockDeleteImage.mockResolvedValue({ result: "ok" });

      // Act
      await service.deleteContentImage(key1);
      await service.deleteContentImage(key2);

      // Assert
      expect(mockDeleteImage).toHaveBeenCalledTimes(2);
      expect(mockDeleteImage).toHaveBeenNthCalledWith(1, key1);
      expect(mockDeleteImage).toHaveBeenNthCalledWith(2, key2);
    });
  });
});
