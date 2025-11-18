import type { News } from "../../lib/db";
import type { NewsFilter, NewsRepository } from "./news.repository";

/**
 * ニュース一覧のレスポンス型
 */
export type NewsListResponse = {
  news: News[];
  total: number;
  limit: number;
  offset: number;
};

/**
 * ニュースServiceの型定義
 */
export type NewsService = {
  /**
   * ニュース一覧を取得
   * @param filter フィルタ条件
   * @returns ニュース一覧とメタデータ
   */
  getNewsList: (filter?: NewsFilter) => Promise<NewsListResponse>;

  /**
   * ニュース詳細を取得
   * @param id ニュースID
   * @returns ニュース、存在しない場合はnull
   */
  getNewsById: (id: string) => Promise<News | null>;
};

/**
 * ニュースServiceのファクトリー関数
 * @param newsRepository NewsRepository
 * @returns NewsService
 */
export const createNewsService = (newsRepository: NewsRepository): NewsService => ({
  getNewsList: async (filter?: NewsFilter): Promise<NewsListResponse> => {
    const { limit = 20, offset = 0 } = filter ?? {};

    const [news, total] = await Promise.all([
      newsRepository.findMany(filter),
      newsRepository.count(filter?.category),
    ]);

    return {
      news,
      total,
      limit,
      offset,
    };
  },

  getNewsById: async (id: string): Promise<News | null> => {
    return newsRepository.findById(id);
  },
});
