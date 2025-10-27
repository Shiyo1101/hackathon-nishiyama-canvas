import type { AppType } from "@api/index";
import { hc } from "hono/client";
import { API_URL } from "./constants";

/**
 * Hono RPCを使用した型安全なAPIクライアント。
 */
export const apiClient = hc<AppType>(API_URL, {
  init: {
    credentials: "include", // Cookie送信を有効化
  },
});
