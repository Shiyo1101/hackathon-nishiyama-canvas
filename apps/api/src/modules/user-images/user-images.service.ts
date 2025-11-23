/**
 * UserImageサービス
 *
 * ユーザーアップロード画像のビジネスロジックを提供
 */
import type { UsageType, UserImage } from "@prisma/client";
import { ForbiddenError, NotFoundError } from "../../lib/errors";
import type { UserImageRepository } from "./user-images.repository";
import { createUserImageRepository } from "./user-images.repository";

/**
 * UserImageサービスの型定義
 */
export type UserImageService = {
  /**
   * ユーザーの画像を取得
   */
  getUserImageById: (imageId: string, userId: string) => Promise<UserImage>;

  /**
   * ユーザーの画像一覧を取得
   */
  getUserImages: (
    userId: string,
    options?: { usageType?: UsageType; limit?: number; offset?: number },
  ) => Promise<{ images: UserImage[]; total: number }>;

  /**
   * 画像を削除
   */
  deleteUserImage: (imageId: string, userId: string) => Promise<void>;

  /**
   * ユーザー画像を作成
   */
  createUserImage: (data: {
    userId: string;
    imageUrl: string;
    thumbnailUrl?: string;
    fileSize: number;
    mimeType: string;
    usageType: UsageType;
  }) => Promise<UserImage>;
};

/**
 * UserImageサービスファクトリー関数
 */
export const createUserImageService = (
  repository: UserImageRepository = createUserImageRepository(),
): UserImageService => {
  return {
    getUserImageById: async (imageId, userId) => {
      // 画像が存在するか確認
      const image = await repository.findById(imageId);

      if (!image) {
        throw new NotFoundError("画像が見つかりません");
      }

      // 所有者確認
      if (image.userId !== userId) {
        throw new ForbiddenError("この画像を閲覧する権限がありません");
      }

      return image;
    },

    getUserImages: async (userId, options = {}) => {
      const { usageType, limit = 50, offset = 0 } = options;

      const [images, total] = await Promise.all([
        repository.findByUserId(userId, { usageType, limit, offset }),
        repository.countByUserId(userId, usageType),
      ]);

      return { images, total };
    },

    deleteUserImage: async (imageId, userId) => {
      // 画像が存在するか確認
      const image = await repository.findById(imageId);

      if (!image) {
        throw new NotFoundError("画像が見つかりません");
      }

      // 所有者確認
      if (image.userId !== userId) {
        throw new ForbiddenError("この画像を削除する権限がありません");
      }

      // 削除実行
      await repository.delete(imageId);
    },

    createUserImage: async (data) => {
      return repository.create(data);
    },
  };
};
