/**
 * ニュース選択コンポーネント
 *
 * ニュース一覧を表示し、ドラッグ&ドロップでキャンバスに配置可能にする
 */
"use client";

import type { News } from "@api";
import { Calendar } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type NewsSelectorPresentationProps = {
  /** 取得するニュースの最大件数 */
  limit?: number;
  /** カテゴリフィルター */
  category?: string;
  /** 選択中のID (モーダル選択モード用) */
  selectedId?: string | null;
  /** クリック時のハンドラー (モーダル選択モード用) */
  onItemClick?: (newsId: string) => void;
  /** ドラッグ開始時のハンドラー */
  onDragStart?: (newsId: string, event: React.DragEvent) => void;
  /** ドラッグ終了時のハンドラー */
  onDragEnd?: () => void;
};

export const NewsSelectorPresentation = ({
  limit = 20,
  category,
  selectedId,
  onItemClick,
  onDragStart,
  onDragEnd,
}: NewsSelectorPresentationProps): React.JSX.Element => {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  // ニュースデータを取得
  useEffect(() => {
    const fetchNews = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(undefined);

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

  const isDragMode = !!onDragStart;
  // 日付フォーマット関数
  const formatDate = (date: Date | string | null): string => {
    if (!date) return "";
    const d = new Date(date);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  };

  return (
    <div className="space-y-2">
      {/* ローディング状態 */}
      {isLoading && (
        <div className="py-8 text-center text-muted-foreground text-sm">読み込み中...</div>
      )}

      {/* エラー状態 */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive text-sm">
          {error}
        </div>
      )}

      {/* ニュース一覧 */}
      {!isLoading && !error && news.length === 0 && (
        <div className="py-6 text-center text-muted-foreground text-sm">ニュースがありません</div>
      )}

      {!isLoading &&
        !error &&
        news.map((item) => {
          const isSelected = selectedId === item.id;
          const handleKeyDown = (e: React.KeyboardEvent): void => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onItemClick?.(item.id);
            }
          };
          return (
            // biome-ignore lint/a11y/useSemanticElements: <!-- IGNORE -->
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              draggable={isDragMode}
              onClick={() => onItemClick?.(item.id)}
              onKeyDown={handleKeyDown}
              onDragStart={(e) => onDragStart?.(item.id, e)}
              onDragEnd={onDragEnd}
              className={`group rounded-lg border bg-card p-3 transition-all hover:shadow-md ${
                isDragMode ? "cursor-move hover:border-primary hover:bg-accent" : "cursor-pointer"
              } ${isSelected ? "border-primary bg-accent shadow-md" : ""}`}
            >
              <div className="flex gap-3">
                {/* サムネイル画像 */}
                {item.imageUrl && (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}

                {/* テキストコンテンツ */}
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 font-medium text-sm group-hover:text-primary">
                    {item.title}
                  </h3>
                  {item.summary && (
                    <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                      {item.summary}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-muted-foreground text-xs">
                    {item.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formatDate(item.publishedAt)}
                      </span>
                    )}
                    {item.category && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};
