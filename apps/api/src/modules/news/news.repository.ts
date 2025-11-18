import type { News, PrismaClient } from "../../lib/db";

/**
 * ニュース取得のためのフィルタ条件
 */
export type NewsFilter = {
  category?: string;
  limit?: number;
  offset?: number;
};

/**
 * ニュースRepositoryの型定義
 */
export type NewsRepository = {
  /**
   * ニュース一覧を取得
   * @param filter フィルタ条件（category, limit, offset）
   * @returns ニュースの配列
   */
  findMany: (filter?: NewsFilter) => Promise<News[]>;

  /**
   * IDでニュースを取得
   * @param id ニュースID
   * @returns ニュース、存在しない場合はnull
   */
  findById: (id: string) => Promise<News | null>;

  /**
   * ニュースの総数を取得
   * @param category カテゴリフィルタ（オプション）
   * @returns ニュースの総数
   */
  count: (category?: string) => Promise<number>;
};

/**
 * ニュースRepositoryのファクトリー関数
 * @param prisma Prismaクライアント
 * @returns NewsRepository
 */
export const createNewsRepository = (prisma: PrismaClient): NewsRepository => ({
  findMany: async (filter?: NewsFilter): Promise<News[]> => {
    const { category, limit = 20, offset = 0 } = filter ?? {};

    return prisma.news.findMany({
      where: category ? { category } : undefined,
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip: offset,
    });
  },

  findById: async (id: string): Promise<News | null> => {
    return prisma.news.findUnique({
      where: { id },
    });
  },

  count: async (category?: string): Promise<number> => {
    return prisma.news.count({
      where: category ? { category } : undefined,
    });
  },
});
