/**
 * 型安全なAPIクライアント
 *
 * Hono RPCを使用してバックエンドとの型安全な通信を実現
 * 型は apps/api/dist/index.d.ts から自動的に取得される
 *
 * 参考:
 * - Hono RPC: https://hono.dev/docs/guides/rpc
 * - Best Practices: https://hono.dev/docs/guides/best-practices
 */
import type { AppType } from "@api";
import { hc } from "hono/client";
import { API_URL } from "./constants";

export const apiClient = hc<AppType>(`${API_URL}/api`, {
  init: {
    credentials: "include", // Cookie送信を有効化（Better Auth用）
  },
});
