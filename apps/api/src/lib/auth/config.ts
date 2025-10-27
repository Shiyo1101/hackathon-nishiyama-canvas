/**
 * 認証設定
 *
 * Better Authの設定を型安全に管理
 */

import type { BetterAuthOptions } from "better-auth";

/**
 * 認証環境変数の型
 */
export interface AuthEnv {
  // Base configuration
  AUTH_URL: string;
  AUTH_SECRET: string;
  FRONTEND_URL: string;

  // OAuth providers
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  DISCORD_CLIENT_ID?: string;
  DISCORD_CLIENT_SECRET?: string;
  LINE_CLIENT_ID?: string;
  LINE_CLIENT_SECRET?: string;
}

/**
 * セッション設定の定数
 */
export const SESSION_CONFIG = {
  EXPIRES_IN: 60 * 60 * 24 * 7, // 7日間
  UPDATE_AGE: 60 * 60 * 24, // 1日ごとに更新
  COOKIE_MAX_AGE: 5 * 60, // 5分間キャッシュ
} as const;

/**
 * 環境変数を型安全に取得
 */
export const getAuthEnv = (): AuthEnv => {
  return {
    AUTH_URL: process.env.AUTH_URL || "http://localhost:8000",
    AUTH_SECRET: process.env.AUTH_SECRET || "",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    LINE_CLIENT_ID: process.env.LINE_CLIENT_ID,
    LINE_CLIENT_SECRET: process.env.LINE_CLIENT_SECRET,
  };
};

/**
 * Better Auth の socialProviders 設定を生成
 */
export const createSocialProvidersConfig = (env: AuthEnv): BetterAuthOptions["socialProviders"] => {
  const providers: BetterAuthOptions["socialProviders"] = {};

  // Googleプロバイダー（有効な場合のみ追加）
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    providers.google = {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    };
  }

  // Discordプロバイダー（有効な場合のみ追加）
  if (env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET) {
    providers.discord = {
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    };
  }

  // LINEプロバイダー（有効な場合のみ追加）
  if (env.LINE_CLIENT_ID && env.LINE_CLIENT_SECRET) {
    providers.line = {
      clientId: env.LINE_CLIENT_ID,
      clientSecret: env.LINE_CLIENT_SECRET,
    };
  }

  return providers;
};

/**
 * セッション設定を生成
 */
export const createSessionConfig = (): BetterAuthOptions["session"] => {
  return {
    expiresIn: SESSION_CONFIG.EXPIRES_IN,
    updateAge: SESSION_CONFIG.UPDATE_AGE,
    cookieCache: {
      enabled: true,
      maxAge: SESSION_CONFIG.COOKIE_MAX_AGE,
    },
  };
};

/**
 * 環境変数の検証
 */
export const validateAuthEnv = (env: AuthEnv): void => {
  if (!env.AUTH_SECRET) {
    console.warn("⚠️  AUTH_SECRET is not set. Using default value for development only.");
  }

  const enabledProviders = [];
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    enabledProviders.push("Google");
  }
  if (env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET) {
    enabledProviders.push("Discord");
  }
  if (env.LINE_CLIENT_ID && env.LINE_CLIENT_SECRET) {
    enabledProviders.push("LINE");
  }

  if (enabledProviders.length === 0) {
    console.warn("⚠️  No OAuth providers are configured.");
  } else {
    console.log(`✓ OAuth providers enabled: ${enabledProviders.join(", ")}`);
  }
};
