/**
 * Cloudinary設定
 *
 * 画像アップロード・管理サービス
 */
import { v2 as cloudinary } from "cloudinary";

// Cloudinary設定
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Cloudinaryインスタンスをエクスポート
 */
export { cloudinary };

/**
 * 画像アップロード設定の型定義
 */
export type UploadOptions = {
  /** アップロード先フォルダ */
  folder?: string;
  /** 公開ID（カスタム指定する場合） */
  public_id?: string;
  /** リソースタイプ */
  resource_type?: "image" | "video" | "raw" | "auto";
  /** 画像変換オプション */
  transformation?: Array<{
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
  }>;
  /** タグ */
  tags?: string[];
};

/**
 * アップロード結果の型定義
 */
export type UploadResult = {
  /** 公開ID */
  public_id: string;
  /** バージョン */
  version: number;
  /** 署名 */
  signature: string;
  /** 幅 */
  width: number;
  /** 高さ */
  height: number;
  /** フォーマット */
  format: string;
  /** リソースタイプ */
  resource_type: string;
  /** 作成日時 */
  created_at: string;
  /** タグ */
  tags: string[];
  /** バイト数 */
  bytes: number;
  /** タイプ */
  type: string;
  /** Etag */
  etag: string;
  /** プレースホルダー */
  placeholder: boolean;
  /** URL */
  url: string;
  /** セキュアURL */
  secure_url: string;
  /** アセットID (オプショナル) */
  asset_id?: string;
  /** バージョンID (オプショナル) */
  version_id?: string;
};

/**
 * 画像をアップロード
 *
 * @param file - アップロードするファイル（Buffer | base64文字列 | ファイルパス）
 * @param options - アップロードオプション
 * @returns アップロード結果
 */
export const uploadImage = async (
  file: Buffer | string,
  options: UploadOptions = {},
): Promise<UploadResult> => {
  const defaultOptions = {
    folder: "nishiyama-canvas",
    resource_type: "auto" as const,
    ...options,
  };

  return new Promise((resolve, reject) => {
    if (Buffer.isBuffer(file)) {
      // Bufferの場合はストリームアップロード
      const uploadStream = cloudinary.uploader.upload_stream(
        defaultOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result as UploadResult);
          } else {
            reject(new Error("Upload failed: No result returned"));
          }
        },
      );
      uploadStream.end(file);
    } else {
      // 文字列の場合は直接アップロード（base64 or ファイルパス）
      cloudinary.uploader
        .upload(file, defaultOptions)
        .then((result) => resolve(result as UploadResult))
        .catch(reject);
    }
  });
};

/**
 * 画像を削除
 *
 * @param publicId - 削除する画像の公開ID
 * @returns 削除結果
 */
export const deleteImage = async (
  publicId: string,
): Promise<{ result: string }> => {
  return cloudinary.uploader.destroy(publicId);
};

/**
 * 画像URLを生成
 *
 * @param publicId - 画像の公開ID
 * @param options - 変換オプション
 * @returns 画像URL
 */
export const getImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
  } = {},
): string => {
  return cloudinary.url(publicId, {
    secure: true,
    ...options,
  });
};

/**
 * サムネイルURLを生成
 *
 * @param publicId - 画像の公開ID
 * @param width - 幅（デフォルト: 300）
 * @param height - 高さ（デフォルト: 300）
 * @returns サムネイルURL
 */
export const getThumbnailUrl = (
  publicId: string,
  width = 300,
  height = 300,
): string => {
  return getImageUrl(publicId, {
    width,
    height,
    crop: "fill",
    quality: "auto",
  });
};
