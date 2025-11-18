/**
 * Better Auth インスタンス
 *
 * ソーシャルログイン（Google, Discord, LINE）+ メール・パスワード認証に対応
 * 開発環境用にメール・パスワード認証を有効化
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcrypt";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, customSession } from "better-auth/plugins";
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
export const auth = betterAuth({
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

  // メール・パスワード認証設定（開発環境用）
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // 開発環境では検証を無効化
    autoSignIn: true, // サインアップ後に自動ログイン
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }) => {
        return await bcrypt.compare(password, hash);
      },
    },
  },

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

  plugins: [
    admin(),
    customSession(async ({ user, session }) => {
      // Prismaから最新のユーザー情報を取得してroleを含める
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      });

      return {
        user: {
          ...user,
          role: dbUser?.role || UserRole.user,
        },
        session,
      };
    }),
  ],
}) as ReturnType<typeof betterAuth>;

/**
 * 認証の型定義
 */
export type Auth = typeof auth;

// Better Authの型を拡張してroleフィールドを追加
export type Session = typeof auth.$Infer.Session & {
  user: typeof auth.$Infer.Session.user & {
    role: UserRole;
  };
};

export type User = Session["user"];
export type SessionData = Session["session"];

// 設定をエクスポート（テスト用）
export { createSocialProvidersConfig, getAuthEnv, validateAuthEnv } from "../../lib/auth/config";
