/**
 * 画像アップロードサービス
 *
 * Cloudinaryを使用した画像アップロード・削除機能を提供
 */
import type { UploadResult } from "../../lib/cloudinary";
import { deleteImage, uploadImage } from "../../lib/cloudinary";

/**
 * 画像アップロード結果
 */
export type ImageUploadResult = {
  /** 画像URL */
  url: string;
  /** セキュアURL（HTTPS） */
  secureUrl: string;
  /** 公開ID */
  publicId: string;
  /** 幅 */
  width: number;
  /** 高さ */
  height: number;
  /** フォーマット */
  format: string;
  /** サイズ（バイト） */
  bytes: number;
};

/**
 * UploadServiceの型定義
 */
export type UploadService = {
  /**
   * 画像をアップロード
   */
  uploadContentImage: (
    file: Buffer,
    fileName: string,
    userId: string,
  ) => Promise<ImageUploadResult>;

  /**
   * 画像を削除
   */
  deleteContentImage: (publicId: string) => Promise<void>;
};

/**
 * UploadServiceファクトリー関数
 */
export const createUploadService = (): UploadService => {
  return {
    uploadContentImage: async (
      file: Buffer,
      fileName: string,
      userId: string,
    ): Promise<ImageUploadResult> => {
      // ファイル名から拡張子を除去
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");

      // アップロードオプション
      const uploadOptions = {
        folder: `nishiyama-canvas/users/${userId}`,
        public_id: `${nameWithoutExt}_${Date.now()}`,
        resource_type: "image" as const,
        transformation: [
          {
            quality: "auto",
          },
        ],
        tags: ["user-upload", userId],
      };

      try {
        const result: UploadResult = await uploadImage(file, uploadOptions);

        return {
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        };
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error("画像のアップロードに失敗しました");
      }
    },

    deleteContentImage: async (publicId: string): Promise<void> => {
      try {
        const result = await deleteImage(publicId);

        if (result.result !== "ok") {
          throw new Error(`削除に失敗しました: ${result.result}`);
        }
      } catch (error) {
        console.error("Cloudinary delete error:", error);
        throw new Error("画像の削除に失敗しました");
      }
    },
  };
};
