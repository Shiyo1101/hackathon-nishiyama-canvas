/**
 * Better Auth インスタンス
 *
 * ソーシャルログイン（Google, Discord, LINE）のみ対応
 * メール・パスワード認証は廃止
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { config } from "dotenv";
import {
  createSessionConfig,
  createSocialProvidersConfig,
  getAuthEnv,
  validateAuthEnv,
} from "../../lib/auth/config";
import { prisma, UserRole } from "../../lib/db";

// 環境変数を先に読み込む（ESモジュールのホイスティング対策）
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const apiRoot = resolve(__dirname, "..", "..", "..");
config({ path: resolve(apiRoot, ".env.local") });
config({ path: resolve(apiRoot, ".env") });

// 環境変数を取得して検証
const env = getAuthEnv();
validateAuthEnv(env);

/**
 * Better Auth インスタンス
 */
export const auth: ReturnType<typeof betterAuth> = betterAuth({
  // データベース接続
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // ベースURL設定（サーバーのルートURL）
  baseURL: env.AUTH_URL,

  // マウントパス設定（デフォルトは /api/auth）
  basePath: "/api/auth",

  // シークレットキー（セッション暗号化用）
  secret: env.AUTH_SECRET,

  // 信頼されたオリジン（CORS設定）
  trustedOrigins: [env.FRONTEND_URL],

  // ソーシャルプロバイダー設定
  socialProviders: createSocialProvidersConfig(env),

  // セッション設定
  session: createSessionConfig(),

  // ユーザー設定
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: UserRole.user,
        input: false, // ユーザーが直接設定できないようにする
      },
    },
  },
});

/**
 * 認証の型定義
 */
export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];

// 設定をエクスポート（テスト用）
export { createSocialProvidersConfig, getAuthEnv, validateAuthEnv } from "../../lib/auth/config";
