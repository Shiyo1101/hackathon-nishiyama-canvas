/**
 * 動物画像選択コンポーネント - プレゼンテーション
 *
 * 動物の画像一覧を表示し、ドラッグ&ドロップでキャンバスに配置可能にする
 */
"use client";

import type { Animal, AnimalImage } from "@api";
import { ImageIcon, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AnimalImageSelectorPresentationProps = {
  /** 動物一覧 */
  animals: Animal[];
  /** 動物画像一覧（選択中の動物） */
  animalImages: AnimalImage[];
  /** ローディング状態 */
  isLoading?: boolean;
  /** エラーメッセージ */
  error?: string;
  /** 動物選択時のハンドラー */
  onAnimalSelect?: (animalId: string) => void;
  /** ドラッグ開始時のハンドラー */
  onDragStart?: (imageId: string, event: React.DragEvent) => void;
  /** ドラッグ終了時のハンドラー */
  onDragEnd?: () => void;
};

export const AnimalImageSelectorPresentation = ({
  animals,
  animalImages,
  isLoading = false,
  error,
  onAnimalSelect,
  onDragStart,
  onDragEnd,
}: AnimalImageSelectorPresentationProps): React.JSX.Element => {
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>("");

  const handleAnimalChange = (value: string): void => {
    setSelectedAnimalId(value);
    onAnimalSelect?.(value);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="size-4" />
          動物画像選択
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 動物選択ドロップダウン */}
        <Select value={selectedAnimalId} onValueChange={handleAnimalChange}>
          <SelectTrigger>
            <SelectValue placeholder="動物を選択してください" />
          </SelectTrigger>
          <SelectContent>
            {animals.map((animal) => (
              <SelectItem key={animal.id} value={animal.id}>
                {animal.name} ({animal.species})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 画像一覧 */}
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="space-y-2">
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

            {/* 動物未選択 */}
            {!isLoading && !error && !selectedAnimalId && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ImageIcon className="mb-2 size-12 opacity-50" />
                <p className="text-sm">動物を選択してください</p>
              </div>
            )}

            {/* 画像なし */}
            {!isLoading && !error && selectedAnimalId && animalImages.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                この動物の画像がありません
              </div>
            )}

            {/* 画像一覧グリッド */}
            {!isLoading &&
              !error &&
              selectedAnimalId &&
              animalImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {animalImages.map((image) => (
                    <div
                      key={image.id}
                      role="button"
                      tabIndex={0}
                      draggable
                      onDragStart={(e) => onDragStart?.(image.id, e)}
                      onDragEnd={onDragEnd}
                      className="group relative aspect-square cursor-move overflow-hidden rounded-lg border bg-muted transition-all hover:border-primary hover:shadow-md"
                    >
                      {image.thumbnailUrl || image.imageUrl ? (
                        <Image
                          src={image.thumbnailUrl || image.imageUrl}
                          alt={image.caption || "動物画像"}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 200px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageIcon className="size-12 text-muted-foreground/50" />
                        </div>
                      )}

                      {/* 注目画像バッジ */}
                      {image.isFeatured && (
                        <div className="absolute top-2 right-2 rounded-full bg-primary px-2 py-0.5 text-primary-foreground text-xs font-medium">
                          注目
                        </div>
                      )}

                      {/* キャプション */}
                      {image.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <p className="text-white text-xs line-clamp-2">
                            {image.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
