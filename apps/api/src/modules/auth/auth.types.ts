/**
 * 認証関連の型定義
 *
 * OpenAPIHonoでの型安全な認証を実現
 */

import type { UserRole } from "../../lib/db";
import type { Session, User } from "./auth.instance";

/**
 * Sessionから抽出した型
 */
type SessionData = Session["session"];

/**
 * ユーザーデータ型（roleを含む）
 */
type UserData = User & {
  role?: UserRole;
};

/**
 * 認証変数（Honoのコンテキストに追加される型）
 */
export type AuthVariables = {
  user: UserData | null;
  session: SessionData | null;
};

/**
 * 認証済みユーザー変数（requireAuth後のコンテキスト）
 */
export type AuthenticatedVariables = {
  user: UserData;
  session: SessionData;
};
