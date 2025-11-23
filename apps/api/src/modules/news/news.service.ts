import type { News } from "../../lib/db";
import type {
  CreateNewsInput,
  NewsFilter,
  NewsRepository,
  UpdateNewsInput,
} from "./news.repository";

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

  /**
   * ニュースを作成（管理者のみ）
   * @param input ニュース作成データ
   * @returns 作成されたニュース
   */
  createNews: (input: CreateNewsInput) => Promise<News>;

  /**
   * ニュースを更新（管理者のみ）
   * @param id ニュースID
   * @param input ニュース更新データ
   * @returns 更新されたニュース
   * @throws Error ニュースが見つからない場合
   */
  updateNews: (id: string, input: UpdateNewsInput) => Promise<News>;

  /**
   * ニュースを削除（管理者のみ）
   * @param id ニュースID
   * @throws Error ニュースが見つからない場合
   */
  deleteNews: (id: string) => Promise<void>;
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

  createNews: async (input: CreateNewsInput): Promise<News> => {
    return newsRepository.create(input);
  },

  updateNews: async (id: string, input: UpdateNewsInput): Promise<News> => {
    const existingNews = await newsRepository.findById(id);
    if (!existingNews) {
      throw new Error("ニュースが見つかりません");
    }

    return newsRepository.update(id, input);
  },

  deleteNews: async (id: string): Promise<void> => {
    const existingNews = await newsRepository.findById(id);
    if (!existingNews) {
      throw new Error("ニュースが見つかりません");
    }

    await newsRepository.delete(id);
  },
});
