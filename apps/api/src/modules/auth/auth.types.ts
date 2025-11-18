/**
 * 認証関連の型定義
 *
 * Honoでの型安全な認証を実現
 */
import type { SessionData, User } from "./auth.instance";

/**
 * 認証変数（Honoのコンテキストに追加される型）
 */
export type AuthVariables = {
  user: User | null;
  session: SessionData | null;
};

/**
 * 認証済みユーザー変数（requireAuth後のコンテキスト）
 */
export type AuthenticatedVariables = {
  user: User;
  session: SessionData;
};
