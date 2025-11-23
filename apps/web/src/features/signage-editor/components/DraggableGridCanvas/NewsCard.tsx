/**
 * ニュースカードコンポーネント
 *
 * ニュースコンテンツを表示
 */
"use client";

import type { News } from "@api";
import { Calendar } from "lucide-react";
import Image from "next/image";

type NewsCardProps = {
  /** ニュースデータ */
  news: News;
};

export const NewsCard = ({ news }: NewsCardProps): React.JSX.Element => {
  const publishedDate =
    typeof news.publishedAt === "string" ? new Date(news.publishedAt) : news.publishedAt;

  const formattedDate = publishedDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative size-full overflow-hidden rounded-md bg-background">
      {/* 背景画像 - 全画面表示 */}
      {news.imageUrl && (
        <div className="absolute inset-0">
          <Image
            src={news.imageUrl}
            alt={news.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      {/* コンテンツ - 上のレイヤー（グラデーション背景付き） */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
        {/* タイトル */}
        <h3 className="mb-1 line-clamp-2 font-semibold text-white text-xs leading-tight drop-shadow-lg">
          {news.title}
        </h3>

        {/* 本文 */}
        {news.content && (
          <p className="mb-2 line-clamp-2 text-white/90 text-xs leading-tight drop-shadow-md">
            {news.content}
          </p>
        )}

        {/* 日付 */}
        <div className="flex items-center gap-1 text-white/80 text-xs drop-shadow-md">
          <Calendar className="size-3" />
          <time dateTime={publishedDate.toISOString()}>{formattedDate}</time>
        </div>
      </div>
    </div>
  );
};
