/**
 * UserImagesルート
 *
 * GET /api/user-images - ユーザーの画像一覧を取得
 * DELETE /api/user-images/:id - ユーザーの画像を削除
 */
import type { Context } from "hono";
import { Hono } from "hono";
import type { AuthenticatedVariables } from "../auth";
import { authMiddleware, requireAuth } from "../auth";
import { createUserImageService } from "./user-images.service";

export const createUserImagesRoutes = () => {
  const app = new Hono<{ Variables: AuthenticatedVariables }>();
  const userImageService = createUserImageService();

  /**
   * GET /api/user-images/:id
   * ユーザーの画像を取得
   */
  app.get(
    "/:id",
    authMiddleware,
    requireAuth,
    async (c: Context<{ Variables: AuthenticatedVariables }>) => {
      try {
        const user = c.get("user");
        const userId = user.id;
        const imageId = c.req.param("id");

        const image = await userImageService.getUserImageById(imageId, userId);

        return c.json({
          success: true,
          data: {
            image,
          },
        });
      } catch (error) {
        console.error("Get user image error:", error);

        const statusCode =
          error instanceof Error && error.message.includes("見つかりません")
            ? 404
            : error instanceof Error && error.message.includes("権限")
              ? 403
              : 500;

        return c.json(
          {
            success: false,
            error: error instanceof Error ? error.message : "画像の取得に失敗しました",
          },
          statusCode,
        );
      }
    },
  );

  /**
   * GET /api/user-images
   * ユーザーの画像一覧を取得
   */
  app.get(
    "/",
    authMiddleware,
    requireAuth,
    async (c: Context<{ Variables: AuthenticatedVariables }>) => {
      try {
        const user = c.get("user");
        const userId = user.id;

        // クエリパラメータを取得
        const usageType = c.req.query("usageType") as "background" | "content" | undefined;
        const limit = Number.parseInt(c.req.query("limit") || "50", 10);
        const offset = Number.parseInt(c.req.query("offset") || "0", 10);

        const result = await userImageService.getUserImages(userId, {
          usageType,
          limit,
          offset,
        });

        return c.json({
          success: true,
          data: {
            images: result.images,
            total: result.total,
            limit,
            offset,
          },
        });
      } catch (error) {
        console.error("Get user images error:", error);
        return c.json(
          {
            success: false,
            error: error instanceof Error ? error.message : "画像一覧の取得に失敗しました",
          },
          500,
        );
      }
    },
  );

  /**
   * DELETE /api/user-images/:id
   * ユーザーの画像を削除
   */
  app.delete(
    "/:id",
    authMiddleware,
    requireAuth,
    async (c: Context<{ Variables: AuthenticatedVariables }>) => {
      try {
        const user = c.get("user");
        const userId = user.id;
        const imageId = c.req.param("id");

        await userImageService.deleteUserImage(imageId, userId);

        return c.json({
          success: true,
          data: {
            message: "画像を削除しました",
          },
        });
      } catch (error) {
        console.error("Delete user image error:", error);

        const statusCode =
          error instanceof Error && error.message.includes("見つかりません")
            ? 404
            : error instanceof Error && error.message.includes("権限")
              ? 403
              : 500;

        return c.json(
          {
            success: false,
            error: error instanceof Error ? error.message : "画像の削除に失敗しました",
          },
          statusCode,
        );
      }
    },
  );

  return app;
};
