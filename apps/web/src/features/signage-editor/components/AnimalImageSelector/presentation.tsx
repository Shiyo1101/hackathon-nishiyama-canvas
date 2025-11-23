/**
 * 動物画像選択コンポーネント
 *
 * 動物の画像一覧を表示し、ドラッグ&ドロップでキャンバスに配置可能にする
 */
"use client";

import type { Animal, AnimalImage } from "@api";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AnimalImageSelectorPresentationProps = {
  /** 選択中のID (モーダル選択モード用・単一選択) */
  selectedId?: string | null;
  /** 選択中のID配列 (モーダル選択モード用・複数選択) */
  selectedIds?: string[];
  /** クリック時のハンドラー (モーダル選択モード用・単一選択) */
  onItemClick?: (imageId: string) => void;
  /** 複数選択時のハンドラー (モーダル選択モード用・複数選択) */
  onItemsSelect?: (imageIds: string[]) => void;
  /** 複数選択モードでの最大選択数 (デフォルト: 3) */
  maxSelection?: number;
  /** ドラッグ開始時のハンドラー */
  onDragStart?: (imageId: string, event: React.DragEvent) => void;
  /** ドラッグ終了時のハンドラー */
  onDragEnd?: () => void;
};

export const AnimalImageSelectorPresentation = ({
  selectedId,
  selectedIds,
  onItemClick,
  onItemsSelect,
  maxSelection = 3,
  onDragStart,
  onDragEnd,
}: AnimalImageSelectorPresentationProps): React.JSX.Element => {
  // 複数選択モードかどうか
  const isMultiSelectMode = !!onItemsSelect;
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [animalImages, setAnimalImages] = useState<AnimalImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>("");

  // 動物一覧を取得
  useEffect(() => {
    const fetchAnimals = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(undefined);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/animals?status=active&limit=100`,
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error("動物の取得に失敗しました");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error("動物の取得に失敗しました");
        }

        setAnimals(data.data.animals);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "動物の取得中にエラーが発生しました";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAnimals();
  }, []);

  // 動物選択時に画像を取得
  const handleAnimalSelect = async (animalId: string): Promise<void> => {
    try {
      setIsLoadingImages(true);
      setError(undefined);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/animals/${animalId}/images?limit=100`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("画像の取得に失敗しました");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("画像の取得に失敗しました");
      }

      setAnimalImages(data.data.images);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "画像の取得中にエラーが発生しました";
      setError(errorMessage);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const isDragMode = !!onDragStart;

  const handleAnimalChange = (value: string): void => {
    setSelectedAnimalId(value);
    void handleAnimalSelect(value);
  };

  // 複数選択モード用: クリックでトグル選択
  const handleMultiSelectClick = (imageId: string): void => {
    if (!isMultiSelectMode || !selectedIds) return;

    const currentIds = [...selectedIds];
    const index = currentIds.indexOf(imageId);

    if (index >= 0) {
      // 既に選択されている場合は削除
      currentIds.splice(index, 1);
    } else {
      // 選択されていない場合は追加（最大数チェック）
      if (currentIds.length < maxSelection) {
        currentIds.push(imageId);
      }
    }

    onItemsSelect?.(currentIds);
  };

  const loading = isLoading || isLoadingImages;

  return (
    <div className="space-y-4">
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

      {/* 複数選択モードの場合、選択数を表示 */}
      {isMultiSelectMode && selectedIds && (
        <div className="rounded-md bg-muted px-3 py-2 text-center text-sm">
          <span className="font-medium">
            {selectedIds.length} / {maxSelection}
          </span>
          <span className="ml-1 text-muted-foreground">枚選択中</span>
        </div>
      )}

      {/* 画像一覧 */}
      <div className="space-y-2">
        {/* ローディング状態 */}
        {loading && (
          <div className="py-8 text-center text-muted-foreground text-sm">読み込み中...</div>
        )}

        {/* エラー状態 */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive text-sm">
            {error}
          </div>
        )}

        {/* 動物未選択 */}
        {!loading && !error && !selectedAnimalId && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ImageIcon className="mb-2 size-8 opacity-50" />
            <p className="text-sm">動物を選択してください</p>
          </div>
        )}

        {/* 画像なし */}
        {!loading && !error && selectedAnimalId && animalImages.length === 0 && (
          <div className="py-6 text-center text-muted-foreground text-sm">
            この動物の画像がありません
          </div>
        )}

        {/* 画像一覧グリッド */}
        {!loading && !error && selectedAnimalId && animalImages.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {animalImages.map((image) => {
              const isSelected = isMultiSelectMode
                ? selectedIds?.includes(image.id)
                : selectedId === image.id;
              const handleKeyDown = (e: React.KeyboardEvent): void => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (isMultiSelectMode) {
                    handleMultiSelectClick(image.id);
                  } else {
                    onItemClick?.(image.id);
                  }
                }
              };
              return (
                // biome-ignore lint/a11y/useSemanticElements: <!-- IGNORE -->
                <div
                  key={image.id}
                  role="button"
                  tabIndex={0}
                  draggable={isDragMode}
                  onClick={() =>
                    isMultiSelectMode ? handleMultiSelectClick(image.id) : onItemClick?.(image.id)
                  }
                  onKeyDown={handleKeyDown}
                  onDragStart={(e) => onDragStart?.(image.id, e)}
                  onDragEnd={onDragEnd}
                  className={`group relative aspect-square overflow-hidden rounded-lg border bg-muted transition-all hover:shadow-md ${
                    isDragMode ? "cursor-move hover:border-primary" : "cursor-pointer"
                  } ${isSelected ? "border-primary shadow-md ring-2 ring-primary" : ""}`}
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

                  {/* 複数選択モード: 選択順バッジ */}
                  {isMultiSelectMode && isSelected && selectedIds && (
                    <div className="absolute top-2 left-2 z-10 flex size-6 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xs shadow-md">
                      {selectedIds.indexOf(image.id) + 1}
                    </div>
                  )}

                  {/* 注目画像バッジ */}
                  {image.isFeatured && (
                    <div className="absolute top-2 right-2 rounded-full bg-primary px-2 py-0.5 font-medium text-primary-foreground text-xs">
                      注目
                    </div>
                  )}

                  {/* キャプション */}
                  {image.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-2">
                      <p className="line-clamp-2 text-white text-xs">{image.caption}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
