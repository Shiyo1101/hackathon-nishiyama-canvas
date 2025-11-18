/**
 * 動物画像選択コンポーネント - クライアント版
 *
 * クライアントサイドでデータ取得とイベントハンドリングを行う
 */
"use client";

import type { Animal, AnimalImage } from "@api";
import { useEffect, useState } from "react";
import { AnimalImageSelectorPresentation } from "./presentation";

type AnimalImageSelectorClientProps = {
  /** ドラッグ開始時のハンドラー */
  onDragStart?: (imageId: string, event: React.DragEvent) => void;
  /** ドラッグ終了時のハンドラー */
  onDragEnd?: () => void;
};

export const AnimalImageSelectorClient = ({
  onDragStart,
  onDragEnd,
}: AnimalImageSelectorClientProps): React.JSX.Element => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [animalImages, setAnimalImages] = useState<AnimalImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [error, setError] = useState<string | undefined>();

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

  return (
    <AnimalImageSelectorPresentation
      animals={animals}
      animalImages={animalImages}
      isLoading={isLoading || isLoadingImages}
      error={error}
      onAnimalSelect={handleAnimalSelect}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  );
};
