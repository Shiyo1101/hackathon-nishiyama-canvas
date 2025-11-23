/**
 * ニュースモジュール
 * @module news
 */

import type { News as PrismaNews } from "@prisma/client";

/**
 * シリアライズされたNews型
 * JSONレスポンスではDateTimeがstring型に変換されるため、型定義もstringにする
 */
export type News = Omit<PrismaNews, "publishedAt" | "createdAt" | "updatedAt"> & {
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export { createAdminNewsRoutes } from "./news.admin.routes";
export type {
  CreateNewsInput,
  NewsFilter,
  NewsRepository,
  UpdateNewsInput,
} from "./news.repository";
export { createNewsRepository } from "./news.repository";
export { newsRoutes } from "./news.routes";
export type { NewsListResponse, NewsService } from "./news.service";
export { createNewsService } from "./news.service";
