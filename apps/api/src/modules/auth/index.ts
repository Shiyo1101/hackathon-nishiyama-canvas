/**
 * 認証モジュール
 */

export type { Auth, Session, SessionData, User } from "./auth.instance";
export { auth } from "./auth.instance";
export { authMiddleware, requireAuth } from "./auth.middleware";
export type { AuthenticatedVariables, AuthVariables } from "./auth.types";

/**
 * ソーシャルログインプロバイダーの型定義
 */
export type SocialProviderType = "google" | "discord" | "line";
