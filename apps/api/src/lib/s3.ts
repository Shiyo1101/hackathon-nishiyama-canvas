/**
 * AWS S3設定
 *
 * 画像アップロード・管理サービス
 * ローカル開発環境ではLocalStackを使用
 */

import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3クライアント設定
const s3Config = {
  region: process.env.AWS_REGION || "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  // LocalStack用エンドポイント(本番環境では undefined)
  endpoint: process.env.AWS_ENDPOINT_URL,
  // LocalStack用にPath Style URLを使用
  forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === "true",
};

export const s3Client = new S3Client(s3Config);

export const S3_BUCKET = process.env.AWS_S3_BUCKET || "";

/**
 * 画像アップロード設定の型定義
 */
export type UploadOptions = {
  /** アップロード先フォルダ */
  folder?: string;
  /** ファイル名(カスタム指定する場合) */
  fileName?: string;
  /** コンテンツタイプ */
  contentType?: string;
  /** メタデータ */
  metadata?: Record<string, string>;
};

/**
 * アップロード結果の型定義
 */
export type UploadResult = {
  /** S3オブジェクトキー */
  key: string;
  /** バケット名 */
  bucket: string;
  /** リージョン */
  region: string;
  /** 画像URL */
  url: string;
  /** ETag */
  etag: string;
  /** ファイルサイズ(バイト) */
  size: number;
};

/**
 * 画像をS3にアップロード
 *
 * @param file - アップロードするファイル(Buffer)
 * @param options - アップロードオプション
 * @returns アップロード結果
 */
export const uploadImage = async (
  file: Buffer,
  options: UploadOptions = {},
): Promise<UploadResult> => {
  const fileName = options.fileName || `${randomUUID()}.jpg`;
  const folder = options.folder || "uploads";
  const key = `${folder}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: file,
    ContentType: options.contentType || "image/jpeg",
    Metadata: options.metadata,
  });

  const response = await s3Client.send(command);

  const url = getImageUrl(key);

  return {
    key,
    bucket: S3_BUCKET,
    region: s3Config.region,
    url,
    etag: response.ETag || "",
    size: file.length,
  };
};

/**
 * 画像を削除
 *
 * @param key - 削除する画像のS3キー
 * @returns 削除結果
 */
export const deleteImage = async (key: string): Promise<{ result: string }> => {
  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  await s3Client.send(command);

  return { result: "ok" };
};

/**
 * 画像URLを生成
 *
 * @param key - 画像のS3キー
 * @returns 画像URL
 */
export const getImageUrl = (key: string): string => {
  if (process.env.AWS_ENDPOINT_URL) {
    // LocalStack用のURL
    return `${process.env.AWS_ENDPOINT_URL}/${S3_BUCKET}/${key}`;
  }
  // 本番環境のS3 URL
  return `https://${S3_BUCKET}.s3.${s3Config.region}.amazonaws.com/${key}`;
};

/**
 * 署名付きURLを生成(プライベート画像用)
 *
 * @param key - 画像のS3キー
 * @param expiresIn - URL有効期限(秒)
 * @returns 署名付きURL
 */
export const getSignedImageUrl = async (key: string, expiresIn = 3600): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
};

/**
 * サムネイルURLを生成
 *
 * 注: S3では自動的な画像変換機能がないため、
 * 事前にサムネイルを生成してアップロードする必要があります
 *
 * @param key - 画像のS3キー
 * @returns サムネイルURL(元画像のURLを返す)
 */
export const getThumbnailUrl = (key: string): string => {
  // 簡易実装: サムネイル用のキーパターンを仮定
  // 実際には事前にサムネイルを生成してアップロードする必要がある
  const thumbnailKey = key.replace(/(\.[^.]+)$/, "_thumb$1");
  return getImageUrl(thumbnailKey);
};
