import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { API_URL } from "./constants";

/**
 * Better Auth クライアント
 *
 * baseURL: Better Authサーバーのルートurl
 * - バックエンドのBetter Authは basePath: "/api/auth" で設定されている
 * - baseURLにはサーバーのルートURLを設定し、basePathは自動的に追加される
 * - 結果として、エンドポイントは http://localhost:8000/api/auth/* になる
 *
 * plugins:
 * - customSessionClient: customSessionプラグインで追加されたフィールド（roleなど）を型推論
 * - adminClient: 管理者機能
 */
export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
        },
      },
    }),
    adminClient(),
  ],
});
