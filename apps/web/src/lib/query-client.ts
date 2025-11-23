/**
 * React Query クライアント設定
 */
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // データの再検証間隔（5分）
      staleTime: 5 * 60 * 1000,
      // キャッシュ時間（10分）
      gcTime: 10 * 60 * 1000,
      // エラー時の自動リトライ
      retry: 1,
      // リフェッチ設定
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});
