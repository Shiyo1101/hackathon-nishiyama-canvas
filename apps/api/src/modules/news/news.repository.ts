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
 * ニュース作成入力
 */
export type CreateNewsInput = {
  title: string;
  content: string;
  summary?: string;
  category?: string;
  imageUrl?: string;
  publishedAt?: Date;
};

/**
 * ニュース更新入力
 */
export type UpdateNewsInput = {
  title?: string;
  content?: string;
  summary?: string;
  category?: string;
  imageUrl?: string;
  publishedAt?: Date;
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

  /**
   * ニュースを作成
   * @param input ニュース作成データ
   * @returns 作成されたニュース
   */
  create: (input: CreateNewsInput) => Promise<News>;

  /**
   * ニュースを更新
   * @param id ニュースID
   * @param input ニュース更新データ
   * @returns 更新されたニュース
   */
  update: (id: string, input: UpdateNewsInput) => Promise<News>;

  /**
   * ニュースを削除
   * @param id ニュースID
   */
  delete: (id: string) => Promise<void>;
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

  create: async (input: CreateNewsInput): Promise<News> => {
    return prisma.news.create({
      data: {
        title: input.title,
        content: input.content,
        summary: input.summary,
        category: input.category,
        imageUrl: input.imageUrl,
        publishedAt: input.publishedAt ?? new Date(),
      },
    });
  },

  update: async (id: string, input: UpdateNewsInput): Promise<News> => {
    return prisma.news.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.content !== undefined && { content: input.content }),
        ...(input.summary !== undefined && { summary: input.summary }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
        ...(input.publishedAt !== undefined && { publishedAt: input.publishedAt }),
      },
    });
  },

  delete: async (id: string): Promise<void> => {
    await prisma.news.delete({
      where: { id },
    });
  },
});
