/**
 * UserImageリポジトリ
 *
 * ユーザーアップロード画像のデータアクセスを提供
 */
import type { PrismaClient, UsageType, UserImage } from "@prisma/client";
import { prisma as db } from "../../lib/db";

/**
 * UserImageリポジトリの型定義
 */
export type UserImageRepository = {
  /**
   * ユーザーの画像を作成
   */
  create: (data: {
    userId: string;
    imageUrl: string;
    thumbnailUrl?: string;
    fileSize: number;
    mimeType: string;
    usageType: UsageType;
  }) => Promise<UserImage>;

  /**
   * IDで画像を取得
   */
  findById: (id: string) => Promise<UserImage | null>;

  /**
   * ユーザーIDで画像一覧を取得
   */
  findByUserId: (
    userId: string,
    options?: { usageType?: UsageType; limit?: number; offset?: number },
  ) => Promise<UserImage[]>;

  /**
   * 画像を削除
   */
  delete: (id: string) => Promise<void>;

  /**
   * ユーザーの画像総数を取得
   */
  countByUserId: (userId: string, usageType?: UsageType) => Promise<number>;
};

/**
 * UserImageリポジトリファクトリー関数
 */
export const createUserImageRepository = (prisma: PrismaClient = db): UserImageRepository => {
  return {
    create: async (data) => {
      return prisma.userImage.create({
        data,
      });
    },

    findById: async (id) => {
      return prisma.userImage.findUnique({
        where: { id },
      });
    },

    findByUserId: async (userId, options = {}) => {
      const { usageType, limit = 50, offset = 0 } = options;

      return prisma.userImage.findMany({
        where: {
          userId,
          ...(usageType && { usageType }),
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      });
    },

    delete: async (id) => {
      await prisma.userImage.delete({
        where: { id },
      });
    },

    countByUserId: async (userId, usageType) => {
      return prisma.userImage.count({
        where: {
          userId,
          ...(usageType && { usageType }),
        },
      });
    },
  };
};
