/**
 * ニュース選択コンポーネント - プレゼンテーション
 *
 * ニュース一覧を表示し、ドラッグ&ドロップでキャンバスに配置可能にする
 */
"use client";

import type { News } from "@api";
import { Calendar, Newspaper } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type NewsSelectorPresentationProps = {
  /** ニュース一覧 */
  news: News[];
  /** ローディング状態 */
  isLoading?: boolean;
  /** エラーメッセージ */
  error?: string;
  /** ドラッグ開始時のハンドラー */
  onDragStart?: (newsId: string, event: React.DragEvent) => void;
  /** ドラッグ終了時のハンドラー */
  onDragEnd?: () => void;
};

export const NewsSelectorPresentation = ({
  news,
  isLoading = false,
  error,
  onDragStart,
  onDragEnd,
}: NewsSelectorPresentationProps): React.JSX.Element => {
  // 日付フォーマット関数
  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const d = new Date(date);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Newspaper className="size-4" />
          ニュース選択
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-2 p-4">
            {/* ローディング状態 */}
            {isLoading && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                読み込み中...
              </div>
            )}

            {/* エラー状態 */}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive text-sm">
                {error}
              </div>
            )}

            {/* ニュース一覧 */}
            {!isLoading && !error && news.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                ニュースがありません
              </div>
            )}

            {!isLoading &&
              !error &&
              news.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  draggable
                  onDragStart={(e) => onDragStart?.(item.id, e)}
                  onDragEnd={onDragEnd}
                  className="group cursor-move rounded-lg border bg-card p-3 transition-all hover:border-primary hover:bg-accent hover:shadow-md"
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
                      <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary">
                        {item.title}
                      </h3>
                      {item.summary && (
                        <p className="mt-1 text-muted-foreground text-xs line-clamp-2">
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
              ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
