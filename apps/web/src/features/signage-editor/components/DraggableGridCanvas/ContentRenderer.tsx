/**
 * コンテンツレンダリングコンポーネント
 *
 * LayoutItemのタイプとcontentIdに基づいて適切なコンテンツを表示
 */
"use client";

import type { LayoutItem } from "@/types";
import {
  useAnimalImageData,
  useAnimalImagesData,
  useNewsData,
  useUserImageData,
} from "../../hooks/useContentData";
import { AnimalImageCard } from "./AnimalImageCard";
import { AnimalImageSlideshow } from "./AnimalImageSlideshow";
import { NewsCard } from "./NewsCard";
import { TextCard } from "./TextCard";
import { TimerCard } from "./TimerCard";
import { UserImageCard } from "./UserImageCard";

type ContentRendererProps = {
  /** レイアウトアイテム */
  item: LayoutItem;
};

/**
 * ローディングスケルトン
 */
const LoadingSkeleton = (): React.JSX.Element => (
  <div className="flex size-full animate-pulse items-center justify-center rounded bg-muted">
    <div className="h-4 w-3/4 rounded bg-muted-foreground/20" />
  </div>
);

/**
 * エラー表示
 */
const ErrorFallback = ({ message }: { message: string }): React.JSX.Element => (
  <div className="flex size-full items-center justify-center text-center text-destructive text-xs">
    <p>{message}</p>
  </div>
);

/**
 * プレースホルダー表示
 */
const PlaceholderCard = ({
  type,
  isSlideshow,
}: {
  type: string;
  isSlideshow?: boolean;
}): React.JSX.Element => {
  const labels: Record<string, string> = {
    news: "ニュース",
    animal: isSlideshow ? "スライドショー" : "動物情報",
    user_image: "自分の画像",
    text: "テキスト",
    weather: "天気情報",
    timer: "タイマー",
  };

  return (
    <div className="flex size-full items-center justify-center text-center text-muted-foreground text-sm">
      <span>{labels[type] || "アイテム"}</span>
    </div>
  );
};

/**
 * コンテンツレンダラー
 */
export const ContentRenderer = ({ item }: ContentRendererProps): React.JSX.Element => {
  const {
    type,
    contentId,
    contentIds,
    textContent,
    style,
    backgroundImageUrl,
    autoRefresh,
    slideshowInterval,
  } = item;

  // ニュースデータ取得（autoRefreshオプション付き）
  const {
    data: newsData,
    isLoading: newsLoading,
    error: newsError,
  } = useNewsData(type === "news" ? contentId : undefined, autoRefresh);

  // 動物画像データ取得（単一画像）
  const {
    data: imageData,
    isLoading: imageLoading,
    error: imageError,
  } = useAnimalImageData(type === "animal" && !contentIds ? contentId : undefined);

  // 動物画像データ取得（複数画像・スライドショー）
  const {
    data: imagesData,
    isLoading: imagesLoading,
    error: imagesError,
  } = useAnimalImagesData(type === "animal" && contentIds ? contentIds : undefined);

  // ユーザー画像データ取得
  const {
    data: userImageData,
    isLoading: userImageLoading,
    error: userImageError,
  } = useUserImageData(type === "user_image" ? contentId : undefined);

  // タイプ別レンダリング
  switch (type) {
    case "news":
      if (newsLoading) return <LoadingSkeleton />;
      if (newsError) return <ErrorFallback message="ニュースの取得に失敗しました" />;
      if (!newsData) return <PlaceholderCard type={type} />;
      return <NewsCard news={newsData} />;

    case "animal": {
      // 複数画像スライドショー
      const isSlideshow = !!(contentIds && contentIds.length > 0);

      // デバッグログ
      console.log("[ContentRenderer] animal type:", {
        contentId,
        contentIds,
        isSlideshow,
        contentIdsLength: contentIds?.length,
      });

      if (isSlideshow) {
        if (imagesLoading) return <LoadingSkeleton />;
        if (imagesError) return <ErrorFallback message="画像の取得に失敗しました" />;
        if (!imagesData || imagesData.length === 0)
          return <PlaceholderCard type={type} isSlideshow={true} />;
        return <AnimalImageSlideshow images={imagesData} interval={slideshowInterval} />;
      }
      // 単一画像
      if (imageLoading) return <LoadingSkeleton />;
      if (imageError) return <ErrorFallback message="画像の取得に失敗しました" />;
      if (!imageData) return <PlaceholderCard type={type} isSlideshow={false} />;
      return <AnimalImageCard image={imageData} />;
    }

    case "text":
      return <TextCard content={textContent} style={style} />;

    case "user_image":
      if (userImageLoading) return <LoadingSkeleton />;
      if (userImageError) return <ErrorFallback message="画像の取得に失敗しました" />;
      if (!userImageData) return <PlaceholderCard type={type} />;
      return <UserImageCard image={userImageData} />;

    case "weather":
      // TODO: 天気情報コンポーネントの実装
      return <PlaceholderCard type={type} />;

    case "timer":
      return <TimerCard style={style} backgroundImage={backgroundImageUrl} />;

    default:
      return <PlaceholderCard type={type} />;
  }
};
