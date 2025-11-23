/**
 * HTTPエラーハンドリングユーティリティ
 *
 * ルートハンドラーで発生するエラーを統一的に処理
 */

import { HTTPException } from "hono/http-exception";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../errors";

/**
 * カスタムエラーから適切なHTTPExceptionを生成
 *
 * instanceof による型安全なエラー判定
 */
export const handleServiceError = (error: unknown): never => {
  // カスタムエラークラスによる判定
  if (error instanceof NotFoundError) {
    throw new HTTPException(404, { message: error.message });
  }

  if (error instanceof ForbiddenError) {
    throw new HTTPException(403, { message: error.message });
  }

  if (error instanceof ConflictError) {
    throw new HTTPException(409, { message: error.message });
  }

  if (error instanceof ValidationError) {
    throw new HTTPException(400, { message: error.message });
  }

  if (error instanceof UnauthorizedError) {
    throw new HTTPException(401, { message: error.message });
  }

  // その他のエラーは500エラーとして処理
  console.error("Unexpected error:", error);
  throw new HTTPException(500, {
    message: "Internal Server Error",
  });
};

/**
 * 認証が必要なエンドポイントでユーザーを取得
 * ユーザーが存在しない場合は401エラーをスロー
 */
export const getAuthenticatedUser = <T extends { user: unknown | null }>(
  context: T,
): NonNullable<T["user"]> => {
  const user = context.user;

  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  return user as NonNullable<T["user"]>;
};
