/**
 * 動物画像カードコンポーネント
 *
 * 動物画像コンテンツを表示
 */
"use client";

import type { AnimalImage } from "@api";
import Image from "next/image";

type AnimalImageCardProps = {
  /** 動物画像データ */
  image: AnimalImage;
};

export const AnimalImageCard = ({ image }: AnimalImageCardProps): React.JSX.Element => {
  return (
    <div className="relative size-full overflow-hidden bg-background">
      {/* 背景画像 - 全画面表示 */}
      <div className="absolute inset-0">
        <Image
          src={image.imageUrl}
          alt={image.caption || "動物画像"}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* キャプション - 上のレイヤー（下部に配置） */}
      {image.caption && (
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="line-clamp-2 text-center text-white text-xs leading-tight drop-shadow-lg">
            {image.caption}
          </p>
        </div>
      )}
    </div>
  );
};
