/**
 * 動物画像スライドショーコンポーネント
 *
 * 複数の動物画像を自動でスライドショー表示
 */
"use client";

import type { AnimalImage } from "@api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type AnimalImageSlideshowProps = {
  /** 動物画像データ配列 */
  images: AnimalImage[];
  /** スライド切り替え間隔（ミリ秒） */
  interval?: number;
};

export const AnimalImageSlideshow = ({
  images,
  interval = 5000,
}: AnimalImageSlideshowProps): React.JSX.Element => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 自動スライド
  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, [images.length, interval]);

  // 次の画像
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  // 前の画像
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0) {
    return (
      <div className="flex size-full items-center justify-center text-center text-muted-foreground text-sm">
        <span>画像がありません</span>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="relative size-full overflow-hidden bg-background">
      {/* 背景画像 - 全画面表示 */}
      <div className="absolute inset-0">
        <Image
          key={currentImage.id}
          src={currentImage.imageUrl}
          alt={currentImage.caption || "動物画像"}
          fill
          priority
          className="object-cover transition-opacity duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* ナビゲーションボタン（複数画像の場合のみ表示） */}
      {images.length > 1 && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-translate-y-1/2 absolute top-1/2 left-2 z-20 bg-black/50 text-white hover:bg-black/70"
            onClick={handlePrev}
            aria-label="前の画像"
          >
            <ChevronLeft className="size-6" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-translate-y-1/2 absolute top-1/2 right-2 z-20 bg-black/50 text-white hover:bg-black/70"
            onClick={handleNext}
            aria-label="次の画像"
          >
            <ChevronRight className="size-6" />
          </Button>

          {/* インジケーター */}
          <div className="absolute inset-x-0 bottom-12 z-20 flex justify-center gap-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                className={`size-2 rounded-full transition-all ${
                  index === currentIndex ? "w-4 bg-white" : "bg-white/50"
                }`}
                onClick={() => {
                  setCurrentIndex(index);
                }}
                aria-label={`画像 ${index + 1} を表示`}
              />
            ))}
          </div>
        </>
      )}

      {/* キャプション */}
      {currentImage.caption && (
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="line-clamp-2 text-center text-white text-xs leading-tight drop-shadow-lg">
            {currentImage.caption}
          </p>
        </div>
      )}
    </div>
  );
};
