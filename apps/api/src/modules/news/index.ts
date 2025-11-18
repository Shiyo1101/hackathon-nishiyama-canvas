/**
 * ニュースモジュール
 * @module news
 */

import type { News } from "@prisma/client";

export type { News };

export { createNewsRepository } from "./news.repository";
export type { NewsFilter, NewsRepository } from "./news.repository";
export { createNewsRoutes } from "./news.routes";
export { createNewsService } from "./news.service";
export type { NewsListResponse, NewsService } from "./news.service";
