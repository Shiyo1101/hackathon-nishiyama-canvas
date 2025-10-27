/**
 * 認証関連の型定義
 */

// ユーザーロール
export const UserRole = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// ソーシャルログインプロバイダー
export const SocialProvider = {
  GOOGLE: "google",
  DISCORD: "discord",
  LINE: "line",
} as const;

export type SocialProviderType = (typeof SocialProvider)[keyof typeof SocialProvider];

// ユーザー情報
export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: UserRoleType;
  createdAt: string;
  updatedAt: string;
}
