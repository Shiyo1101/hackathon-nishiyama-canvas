import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { requireAdmin } from "../auth";
import type { NewsService } from "./news.service";

/**
 * ニュース作成リクエストスキーマ
 */
export const CreateNewsRequestSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(200, "タイトルは200文字以内で入力してください"),
  content: z.string().min(1, "本文は必須です"),
  summary: z.string().max(500, "概要は500文字以内で入力してください").optional(),
  category: z.string().max(50, "カテゴリは50文字以内で入力してください").optional(),
  imageUrl: z.string().url("有効なURLを入力してください").optional(),
  publishedAt: z.string().datetime("有効な日時を入力してください").optional(),
});

/**
 * ニュース更新リクエストスキーマ
 */
export const UpdateNewsRequestSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(200, "タイトルは200文字以内で入力してください")
    .optional(),
  content: z.string().min(1, "本文は必須です").optional(),
  summary: z.string().max(500, "概要は500文字以内で入力してください").optional(),
  category: z.string().max(50, "カテゴリは50文字以内で入力してください").optional(),
  imageUrl: z.string().url("有効なURLを入力してください").optional(),
  publishedAt: z.string().datetime("有効な日時を入力してください").optional(),
});

/**
 * ニュースIDパラメータスキーマ
 */
const newsIdParamSchema = z.object({
  id: z.string().min(1),
});

/**
 * 管理者向けニュースルートファクトリー
 */
export const createAdminNewsRoutes = (newsService: NewsService) => {
  return (
    new Hono()
      .basePath("/admin/news")
      /**
       * POST /admin/news
       * ニュースを作成（管理者のみ）
       */
      .post("/", requireAdmin, zValidator("json", CreateNewsRequestSchema), async (c) => {
        try {
          const body = c.req.valid("json");

          const news = await newsService.createNews({
            title: body.title,
            content: body.content,
            summary: body.summary,
            category: body.category,
            imageUrl: body.imageUrl,
            publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
          });

          return c.json(
            {
              success: true,
              data: { news },
            },
            201,
          );
        } catch (error) {
          console.error("ニュース作成エラー:", error);
          return c.json(
            {
              success: false,
              error: {
                code: "INTERNAL_ERROR",
                message: "ニュースの作成に失敗しました",
              },
            },
            500,
          );
        }
      })
      /**
       * PATCH /admin/news/:id
       * ニュースを更新（管理者のみ）
       */
      .patch(
        "/:id",
        requireAdmin,
        zValidator("param", newsIdParamSchema),
        zValidator("json", UpdateNewsRequestSchema),
        async (c) => {
          try {
            const { id } = c.req.valid("param");
            const body = c.req.valid("json");

            const news = await newsService.updateNews(id, {
              title: body.title,
              content: body.content,
              summary: body.summary,
              category: body.category,
              imageUrl: body.imageUrl,
              publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
            });

            return c.json({
              success: true,
              data: { news },
            });
          } catch (error) {
            console.error("ニュース更新エラー:", error);

            if (error instanceof Error && error.message.includes("見つかりません")) {
              return c.json(
                {
                  success: false,
                  error: {
                    code: "NOT_FOUND",
                    message: error.message,
                  },
                },
                404,
              );
            }

            return c.json(
              {
                success: false,
                error: {
                  code: "INTERNAL_ERROR",
                  message: "ニュースの更新に失敗しました",
                },
              },
              500,
            );
          }
        },
      )
      /**
       * DELETE /admin/news/:id
       * ニュースを削除（管理者のみ）
       */
      .delete("/:id", requireAdmin, zValidator("param", newsIdParamSchema), async (c) => {
        try {
          const { id } = c.req.valid("param");

          await newsService.deleteNews(id);

          return c.json({
            success: true,
            data: { message: "ニュースを削除しました" },
          });
        } catch (error) {
          console.error("ニュース削除エラー:", error);

          if (error instanceof Error && error.message.includes("見つかりません")) {
            return c.json(
              {
                success: false,
                error: {
                  code: "NOT_FOUND",
                  message: error.message,
                },
              },
              404,
            );
          }

          return c.json(
            {
              success: false,
              error: {
                code: "INTERNAL_ERROR",
                message: "ニュースの削除に失敗しました",
              },
            },
            500,
          );
        }
      })
  );
};
