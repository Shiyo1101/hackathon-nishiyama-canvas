import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { createNewsRepository } from "./news.repository";
import { createNewsService } from "./news.service";

/**
 * ニュース一覧取得のクエリパラメータスキーマ
 */
const newsListQuerySchema = z.object({
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

/**
 * ニュースIDパラメータスキーマ
 */
const newsIdParamSchema = z.object({
  id: z.string().min(1),
});

/**
 * ニュースルートのファクトリー関数
 */
export const createNewsRoutes = () => {
  const app = new Hono();

  // サービス初期化
  const newsRepository = createNewsRepository(prisma);
  const newsService = createNewsService(newsRepository);

  /**
   * GET /news
   * ニュース一覧を取得
   */
  app.get("/", zValidator("query", newsListQuerySchema), async (c) => {
    try {
      const query = c.req.valid("query");

      const result = await newsService.getNewsList(query);

      return c.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("ニュース一覧取得エラー:", error);
      return c.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "ニュース一覧の取得に失敗しました",
          },
        },
        500,
      );
    }
  });

  /**
   * GET /news/:id
   * ニュース詳細を取得
   */
  app.get("/:id", zValidator("param", newsIdParamSchema), async (c) => {
    try {
      const { id } = c.req.valid("param");

      const news = await newsService.getNewsById(id);

      if (!news) {
        return c.json(
          {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "ニュースが見つかりません",
            },
          },
          404,
        );
      }

      return c.json({
        success: true,
        data: { news },
      });
    } catch (error) {
      console.error("ニュース詳細取得エラー:", error);
      return c.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "ニュース詳細の取得に失敗しました",
          },
        },
        500,
      );
    }
  });

  return app;
};
