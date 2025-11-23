import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware, requireAdmin } from "../auth";
import type { UserService } from "./user.service";

/**
 * ユーザー一覧取得のクエリパラメータスキーマ
 */
const userListQuerySchema = z.object({
  role: z.enum(["user", "admin"]).optional(),
  banned: z
    .string()
    .optional()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

/**
 * ユーザー更新リクエストスキーマ
 */
export const UpdateUserRequestSchema = z.object({
  name: z.string().max(100, "名前は100文字以内で入力してください").optional(),
  role: z.enum(["user", "admin"]).optional(),
  banned: z.boolean().optional(),
  banReason: z.string().max(500, "BAN理由は500文字以内で入力してください").nullable().optional(),
  banExpires: z.string().datetime("有効な日時を入力してください").nullable().optional(),
});

/**
 * ユーザーIDパラメータスキーマ
 */
const userIdParamSchema = z.object({
  id: z.string().min(1),
});

/**
 * 管理者向けユーザールートファクトリー
 */
export const createAdminUserRoutes = (userService: UserService) => {
  return (
    new Hono()
      .basePath("/admin/users")
      /**
       * GET /admin/users
       * ユーザー一覧を取得(管理者のみ)
       */
      .get(
        "/",
        authMiddleware,
        requireAdmin,
        zValidator("query", userListQuerySchema),
        async (c) => {
          try {
            const query = c.req.valid("query");

            const result = await userService.getUsersList(query);

            return c.json({
              success: true,
              data: result,
            });
          } catch (error) {
            console.error("ユーザー一覧取得エラー:", error);
            return c.json(
              {
                success: false,
                error: {
                  code: "INTERNAL_ERROR",
                  message: "ユーザー一覧の取得に失敗しました",
                },
              },
              500,
            );
          }
        },
      )
      /**
       * GET /admin/users/:id
       * ユーザー詳細を取得(管理者のみ)
       */
      .get(
        "/:id",
        authMiddleware,
        requireAdmin,
        zValidator("param", userIdParamSchema),
        async (c) => {
          try {
            const { id } = c.req.valid("param");

            const user = await userService.getUserById(id);

            if (!user) {
              return c.json(
                {
                  success: false,
                  error: {
                    code: "NOT_FOUND",
                    message: "ユーザーが見つかりません",
                  },
                },
                404,
              );
            }

            return c.json({
              success: true,
              data: { user },
            });
          } catch (error) {
            console.error("ユーザー詳細取得エラー:", error);
            return c.json(
              {
                success: false,
                error: {
                  code: "INTERNAL_ERROR",
                  message: "ユーザー詳細の取得に失敗しました",
                },
              },
              500,
            );
          }
        },
      )
      /**
       * PATCH /admin/users/:id
       * ユーザーを更新(管理者のみ)
       */
      .patch(
        "/:id",
        authMiddleware,
        requireAdmin,
        zValidator("param", userIdParamSchema),
        zValidator("json", UpdateUserRequestSchema),
        async (c) => {
          try {
            const { id } = c.req.valid("param");
            const body = c.req.valid("json");

            const user = await userService.updateUser(id, {
              name: body.name,
              role: body.role,
              banned: body.banned,
              banReason: body.banReason,
              banExpires: body.banExpires ? new Date(body.banExpires) : null,
            });

            return c.json({
              success: true,
              data: { user },
            });
          } catch (error) {
            console.error("ユーザー更新エラー:", error);

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
                  message: "ユーザーの更新に失敗しました",
                },
              },
              500,
            );
          }
        },
      )
      /**
       * DELETE /admin/users/:id
       * ユーザーを削除(管理者のみ)
       */
      .delete(
        "/:id",
        authMiddleware,
        requireAdmin,
        zValidator("param", userIdParamSchema),
        async (c) => {
          try {
            const { id } = c.req.valid("param");

            await userService.deleteUser(id);

            return c.json({
              success: true,
              data: { message: "ユーザーを削除しました" },
            });
          } catch (error) {
            console.error("ユーザー削除エラー:", error);

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
                  message: "ユーザーの削除に失敗しました",
                },
              },
              500,
            );
          }
        },
      )
  );
};
