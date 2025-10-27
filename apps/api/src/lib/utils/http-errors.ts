/**
 * HTTPエラーハンドリングユーティリティ
 *
 * ルートハンドラーで発生するエラーを統一的に処理
 */

import { HTTPException } from "hono/http-exception";

/**
 * エラーメッセージから適切なHTTPExceptionを生成
 */
export const handleServiceError = (error: unknown): never => {
  if (error instanceof Error) {
    const message = error.message;

    // 404エラー
    if (
      message === "サイネージが見つかりません" ||
      message.includes("見つかりません") ||
      message.includes("not found")
    ) {
      throw new HTTPException(404, { message });
    }

    // 403エラー
    if (
      message === "このサイネージを操作する権限がありません" ||
      message.includes("権限がありません") ||
      message.includes("forbidden") ||
      message.includes("not allowed")
    ) {
      throw new HTTPException(403, { message });
    }

    // 409エラー (Conflict)
    if (
      message === "すでにサイネージが存在します" ||
      message === "このスラッグは既に使用されています" ||
      message.includes("すでに") ||
      message.includes("already exists") ||
      message.includes("既に使用")
    ) {
      throw new HTTPException(409, { message });
    }

    // 400エラー (Bad Request) - バリデーションエラー等
    if (message.includes("無効") || message.includes("invalid") || message.includes("validation")) {
      throw new HTTPException(400, { message });
    }
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
