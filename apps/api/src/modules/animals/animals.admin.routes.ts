import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware, requireAdmin } from "../auth";
import type { AnimalsService } from "./animals.service";

/**
 * 動物作成リクエストスキーマ
 */
export const CreateAnimalRequestSchema = z.object({
  name: z.string().min(1, "名前は必須です").max(100, "名前は100文字以内で入力してください"),
  species: z.string().min(1, "種別は必須です").max(100, "種別は100文字以内で入力してください"),
  description: z.string().max(1000, "説明は1000文字以内で入力してください").optional(),
  habitat: z.string().max(200, "生息地は200文字以内で入力してください").optional(),
  diet: z.string().max(500, "食性は500文字以内で入力してください").optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

/**
 * 動物更新リクエストスキーマ
 */
export const UpdateAnimalRequestSchema = z.object({
  name: z
    .string()
    .min(1, "名前は必須です")
    .max(100, "名前は100文字以内で入力してください")
    .optional(),
  species: z
    .string()
    .min(1, "種別は必須です")
    .max(100, "種別は100文字以内で入力してください")
    .optional(),
  description: z.string().max(1000, "説明は1000文字以内で入力してください").optional(),
  habitat: z.string().max(200, "生息地は200文字以内で入力してください").optional(),
  diet: z.string().max(500, "食性は500文字以内で入力してください").optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

/**
 * 動物画像作成リクエストスキーマ
 */
export const CreateAnimalImageRequestSchema = z.object({
  animalId: z.string().min(1, "動物IDは必須です"),
  imageUrl: z.string().url("有効なURLを入力してください"),
  thumbnailUrl: z.string().url("有効なURLを入力してください").optional(),
  caption: z.string().max(200, "キャプションは200文字以内で入力してください").optional(),
  isFeatured: z.boolean().optional(),
});

/**
 * 動物画像更新リクエストスキーマ
 */
export const UpdateAnimalImageRequestSchema = z.object({
  imageUrl: z.string().url("有効なURLを入力してください").optional(),
  thumbnailUrl: z.string().url("有効なURLを入力してください").optional(),
  caption: z.string().max(200, "キャプションは200文字以内で入力してください").optional(),
  isFeatured: z.boolean().optional(),
});

/**
 * IDパラメータスキーマ
 */
const idParamSchema = z.object({
  id: z.string().min(1),
});

/**
 * 管理者向け動物ルートファクトリー
 */
export const createAdminAnimalsRoutes = (animalsService: AnimalsService) => {
  return (
    new Hono()
      .basePath("/admin/animals")
      /**
       * POST /admin/animals
       * 動物を作成（管理者のみ）
       */
      .post(
        "/",
        authMiddleware,
        requireAdmin,
        zValidator("json", CreateAnimalRequestSchema),
        async (c) => {
          try {
            const body = c.req.valid("json");

            const animal = await animalsService.createAnimal(body);

            return c.json(
              {
                success: true,
                data: { animal },
              },
              201,
            );
          } catch (error) {
            console.error("動物作成エラー:", error);
            return c.json(
              {
                success: false,
                error: {
                  code: "INTERNAL_ERROR",
                  message: "動物の作成に失敗しました",
                },
              },
              500,
            );
          }
        },
      )
      /**
       * PATCH /admin/animals/:id
       * 動物を更新（管理者のみ）
       */
      .patch(
        "/:id",
        authMiddleware,
        requireAdmin,
        zValidator("param", idParamSchema),
        zValidator("json", UpdateAnimalRequestSchema),
        async (c) => {
          try {
            const { id } = c.req.valid("param");
            const body = c.req.valid("json");

            const animal = await animalsService.updateAnimal(id, body);

            return c.json({
              success: true,
              data: { animal },
            });
          } catch (error) {
            console.error("動物更新エラー:", error);

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
                  message: "動物の更新に失敗しました",
                },
              },
              500,
            );
          }
        },
      )
      /**
       * DELETE /admin/animals/:id
       * 動物を削除（管理者のみ）
       */
      .delete(
        "/:id",
        authMiddleware,
        requireAdmin,
        zValidator("param", idParamSchema),
        async (c) => {
          try {
            const { id } = c.req.valid("param");

            await animalsService.deleteAnimal(id);

            return c.json({
              success: true,
              data: { message: "動物を削除しました" },
            });
          } catch (error) {
            console.error("動物削除エラー:", error);

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
                  message: "動物の削除に失敗しました",
                },
              },
              500,
            );
          }
        },
      )
      /**
       * POST /admin/animals/images
       * 動物画像を作成（管理者のみ）
       */
      .post(
        "/images",
        authMiddleware,
        requireAdmin,
        zValidator("json", CreateAnimalImageRequestSchema),
        async (c) => {
          try {
            const body = c.req.valid("json");

            const animalImage = await animalsService.createAnimalImage(body);

            return c.json(
              {
                success: true,
                data: { animalImage },
              },
              201,
            );
          } catch (error) {
            console.error("動物画像作成エラー:", error);

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
                  message: "動物画像の作成に失敗しました",
                },
              },
              500,
            );
          }
        },
      )
      /**
       * PATCH /admin/animals/images/:id
       * 動物画像を更新（管理者のみ）
       */
      .patch(
        "/images/:id",
        authMiddleware,
        requireAdmin,
        zValidator("param", idParamSchema),
        zValidator("json", UpdateAnimalImageRequestSchema),
        async (c) => {
          try {
            const { id } = c.req.valid("param");
            const body = c.req.valid("json");

            const animalImage = await animalsService.updateAnimalImage(id, body);

            return c.json({
              success: true,
              data: { animalImage },
            });
          } catch (error) {
            console.error("動物画像更新エラー:", error);

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
                  message: "動物画像の更新に失敗しました",
                },
              },
              500,
            );
          }
        },
      )
      /**
       * DELETE /admin/animals/images/:id
       * 動物画像を削除（管理者のみ）
       */
      .delete(
        "/images/:id",
        authMiddleware,
        requireAdmin,
        zValidator("param", idParamSchema),
        async (c) => {
          try {
            const { id } = c.req.valid("param");

            await animalsService.deleteAnimalImage(id);

            return c.json({
              success: true,
              data: { message: "動物画像を削除しました" },
            });
          } catch (error) {
            console.error("動物画像削除エラー:", error);

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
                  message: "動物画像の削除に失敗しました",
                },
              },
              500,
            );
          }
        },
      )
  );
};
