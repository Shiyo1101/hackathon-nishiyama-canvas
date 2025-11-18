import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { createAnimalsRepository } from "./animals.repository";
import { createAnimalsService } from "./animals.service";

/**
 * 動物一覧取得のクエリパラメータスキーマ
 */
const animalsListQuerySchema = z.object({
  status: z.enum(["active", "inactive"]).optional().default("active"),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

/**
 * 動物IDパラメータスキーマ
 */
const animalIdParamSchema = z.object({
  id: z.string().min(1),
});

/**
 * 動物画像一覧取得のクエリパラメータスキーマ
 */
const animalImagesQuerySchema = z.object({
  isFeatured: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      return val === "true";
    }),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

/**
 * 動物ルートのファクトリー関数
 */
export const createAnimalsRoutes = () => {
  const app = new Hono();

  // サービス初期化
  const animalsRepository = createAnimalsRepository(prisma);
  const animalsService = createAnimalsService(animalsRepository);

  /**
   * GET /animals
   * 動物一覧を取得
   */
  app.get("/", zValidator("query", animalsListQuerySchema), async (c) => {
    try {
      const query = c.req.valid("query");
      const result = await animalsService.getAnimalsList(query);

      return c.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("動物一覧取得エラー:", error);
      return c.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "動物一覧の取得に失敗しました",
          },
        },
        500,
      );
    }
  });

  /**
   * GET /animals/:id
   * 動物詳細を取得
   */
  app.get("/:id", zValidator("param", animalIdParamSchema), async (c) => {
    try {
      const { id } = c.req.valid("param");
      const animal = await animalsService.getAnimalById(id);

      if (!animal) {
        return c.json(
          {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "動物が見つかりません",
            },
          },
          404,
        );
      }

      return c.json({
        success: true,
        data: { animal },
      });
    } catch (error) {
      console.error("動物詳細取得エラー:", error);
      return c.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "動物詳細の取得に失敗しました",
          },
        },
        500,
      );
    }
  });

  /**
   * GET /animals/:id/images
   * 動物の画像一覧を取得
   */
  app.get(
    "/:id/images",
    zValidator("param", animalIdParamSchema),
    zValidator("query", animalImagesQuerySchema),
    async (c) => {
      try {
        const { id } = c.req.valid("param");
        const query = c.req.valid("query");

        // 動物が存在するか確認
        const animal = await animalsService.getAnimalById(id);
        if (!animal) {
          return c.json(
            {
              success: false,
              error: {
                code: "NOT_FOUND",
                message: "動物が見つかりません",
              },
            },
            404,
          );
        }

        const result = await animalsService.getAnimalImages(id, query);

        return c.json({
          success: true,
          data: result,
        });
      } catch (error) {
        console.error("動物画像一覧取得エラー:", error);
        return c.json(
          {
            success: false,
            error: {
              code: "INTERNAL_ERROR",
              message: "動物画像一覧の取得に失敗しました",
            },
          },
          500,
        );
      }
    },
  );

  return app;
};
