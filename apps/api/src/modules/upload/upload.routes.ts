/**
 * 画像アップロードルート
 *
 * POST /api/upload/content - コンテンツ画像のアップロード
 * DELETE /api/upload/content/:publicId - コンテンツ画像の削除
 */
import type { Context } from "hono";
import { Hono } from "hono";
import type { AuthenticatedVariables } from "../auth";
import { createUploadService } from "./upload.service";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const createUploadRoutes = () => {
  const app = new Hono();
  const uploadService = createUploadService();

  /**
   * POST /api/upload/content
   * コンテンツ画像をアップロード
   */
  app.post("/content", async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    try {
      // ユーザー認証チェック（Better Authからユーザー情報を取得）
      const user = c.get("user");

      const userId = user.id;

      // フォームデータを取得
      const body = await c.req.parseBody();
      const file = body.file;

      // ファイルが存在しない
      if (!file || !(file instanceof File)) {
        return c.json(
          {
            success: false,
            error: "ファイルが指定されていません",
          },
          400,
        );
      }

      // ファイルタイプチェック
      if (!ALLOWED_TYPES.includes(file.type)) {
        return c.json(
          {
            success: false,
            error: "許可されていないファイル形式です（JPEG, PNG, WebPのみ）",
          },
          400,
        );
      }

      // ファイルサイズチェック
      if (file.size > MAX_FILE_SIZE) {
        return c.json(
          {
            success: false,
            error: "ファイルサイズが大きすぎます（最大10MB）",
          },
          400,
        );
      }

      // Fileオブジェクトをバッファに変換
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Cloudinaryにアップロード
      const result = await uploadService.uploadContentImage(buffer, file.name, userId);

      return c.json({
        success: true,
        data: {
          image: result,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "画像のアップロードに失敗しました",
        },
        500,
      );
    }
  });

  /**
   * DELETE /api/upload/content/:publicId
   * コンテンツ画像を削除
   */
  app.delete("/content/:publicId", async (c: Context<{ Variables: AuthenticatedVariables }>) => {
    try {
      const publicId = c.req.param("publicId");

      // 公開IDをデコード（URLエンコードされている場合）
      const decodedPublicId = decodeURIComponent(publicId);

      // Cloudinaryから削除
      await uploadService.deleteContentImage(decodedPublicId);

      return c.json({
        success: true,
        data: {
          message: "画像を削除しました",
        },
      });
    } catch (error) {
      console.error("Delete error:", error);
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "画像の削除に失敗しました",
        },
        500,
      );
    }
  });

  return app;
};
