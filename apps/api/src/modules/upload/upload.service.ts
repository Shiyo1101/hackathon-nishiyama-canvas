/**
 * 画像アップロードサービス
 *
 * AWS S3を使用した画像アップロード・削除機能を提供
 */
import type { UploadResult } from "../../lib/s3";
import { deleteImage, uploadImage } from "../../lib/s3";

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
      // ファイル名から拡張子を取得
      const extension = fileName.split(".").pop() || "jpg";
      const timestamp = Date.now();
      const customFileName = `${timestamp}.${extension}`;

      // originalFileNameをBase64エンコードして、HTTPヘッダーで許可される文字のみにする
      const encodedOriginalFileName = Buffer.from(fileName, "utf-8").toString("base64");

      // アップロードオプション
      const uploadOptions = {
        folder: `users/${userId}`,
        fileName: customFileName,
        contentType: `image/${extension}`,
        metadata: {
          userId,
          originalFileName: encodedOriginalFileName, // Base64エンコード済み
          uploadedAt: new Date().toISOString(),
        },
      };

      try {
        const result: UploadResult = await uploadImage(file, uploadOptions);

        return {
          url: result.url,
          secureUrl: result.url, // S3では常にHTTPSを使用
          publicId: result.key, // S3キーをpublicIdとして使用
          width: 0, // S3では画像サイズ情報を返さないため0に設定
          height: 0,
          format: extension,
          bytes: result.size,
        };
      } catch (error) {
        console.error("S3 upload error:", error);
        throw new Error("画像のアップロードに失敗しました");
      }
    },

    deleteContentImage: async (key: string): Promise<void> => {
      try {
        const result = await deleteImage(key);

        if (result.result !== "ok") {
          throw new Error(`削除に失敗しました: ${result.result}`);
        }
      } catch (error) {
        console.error("S3 delete error:", error);
        throw new Error("画像の削除に失敗しました");
      }
    },
  };
};
