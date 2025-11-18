/**
 * ニュース選択コンポーネント - クライアント版
 *
 * クライアントサイドでデータ取得とイベントハンドリングを行う
 */
"use client";

import type { News } from "@api";
import { useEffect, useState } from "react";
import { NewsSelectorPresentation } from "./presentation";

type NewsSelectorClientProps = {
  /** 取得するニュースの最大件数 */
  limit?: number;
  /** カテゴリフィルター */
  category?: string;
  /** ドラッグ開始時のハンドラー */
  onDragStart?: (newsId: string, event: React.DragEvent) => void;
  /** ドラッグ終了時のハンドラー */
  onDragEnd?: () => void;
};

export const NewsSelectorClient = ({
  limit = 20,
  category,
  onDragStart,
  onDragEnd,
}: NewsSelectorClientProps): React.JSX.Element => {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const fetchNews = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(undefined);

        // 通常のfetch APIを使用（Hono RPCの型推論の制限を回避）
        const queryParams = new URLSearchParams({
          limit: limit.toString(),
          offset: "0",
          ...(category && { category }),
        });

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/news?${queryParams.toString()}`,
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error("ニュースの取得に失敗しました");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error("ニュースの取得に失敗しました");
        }

        setNews(data.data.news);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "ニュースの取得中にエラーが発生しました";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchNews();
  }, [limit, category]);

  return (
    <NewsSelectorPresentation
      news={news}
      isLoading={isLoading}
      error={error}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  );
};
