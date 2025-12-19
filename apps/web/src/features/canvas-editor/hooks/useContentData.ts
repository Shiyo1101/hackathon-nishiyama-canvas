/**
 * コンテンツデータ取得フック
 *
 * LayoutItemのcontentIdから実際のニュース・画像データを取得
 * Hono RPCを使用して型安全にデータを取得
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

/**
 * ニュースデータ取得フック
 * @param newsId ニュースID
 * @param autoRefresh 自動更新フラグ（trueの場合1時間ごとにポーリング）
 */
export const useNewsData = (newsId: string | undefined, autoRefresh = false) => {
  return useQuery({
    queryKey: ["news", newsId],
    queryFn: async () => {
      if (!newsId) return null;

      const response = await apiClient.news[":id"].$get({
        param: { id: newsId },
      });

      if (!response.ok) {
        throw new Error("ニュースの取得に失敗しました");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("ニュースの取得に失敗しました");
      }

      return data.data.news;
    },
    enabled: !!newsId,
    refetchInterval: autoRefresh ? 1000 * 60 * 60 : false, // 1時間ごとにポーリング
    staleTime: autoRefresh ? 0 : 1000 * 60 * 5, // autoRefreshの場合は常にfetch、そうでない場合は5分間キャッシュ
  });
};

/**
 * 動物画像データ取得フック
 */
export const useAnimalImageData = (imageId: string | undefined) => {
  return useQuery({
    queryKey: ["animal-image", imageId],
    queryFn: async () => {
      if (!imageId) return null;

      const response = await apiClient.animals.images[":id"].$get({
        param: { id: imageId },
      });

      if (!response.ok) {
        throw new Error("動物画像の取得に失敗しました");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("動物画像の取得に失敗しました");
      }

      return data.data.image;
    },
    enabled: !!imageId,
  });
};

/**
 * ユーザー画像データ取得フック
 */
export const useUserImageData = (imageId: string | undefined) => {
  return useQuery({
    queryKey: ["user-image", imageId],
    queryFn: async () => {
      if (!imageId) return null;

      // @ts-expect-error - user-imagesルートがapiClientの型に含まれていないため一時的に無視
      const response = await apiClient["user-images"][":id"].$get({
        param: { id: imageId },
      });

      if (!response.ok) {
        throw new Error("ユーザー画像の取得に失敗しました");
      }

      const data = (await response.json()) as {
        success: boolean;
        data?: { image: { id: string; imageUrl: string; thumbnailUrl?: string | null } };
        error?: string;
      };

      if (!data.success || !data.data) {
        throw new Error(data.error || "ユーザー画像の取得に失敗しました");
      }

      return data.data.image;
    },
    enabled: !!imageId,
  });
};

/**
 * 複数動物画像データ取得フック（スライドショー用）
 * @param imageIds 画像ID配列（最大3つ）
 */
export const useAnimalImagesData = (imageIds: string[] | undefined) => {
  return useQuery({
    queryKey: ["animal-images-multiple", imageIds],
    queryFn: async () => {
      if (!imageIds || imageIds.length === 0) return [];

      // 最大3つまでに制限
      const limitedIds = imageIds.slice(0, 3);

      // 並列で全ての画像を取得
      const promises = limitedIds.map(async (id) => {
        const response = await apiClient.animals.images[":id"].$get({
          param: { id },
        });

        if (!response.ok) {
          throw new Error(`動物画像 ${id} の取得に失敗しました`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(`動物画像 ${id} の取得に失敗しました`);
        }

        return data.data.image;
      });

      return await Promise.all(promises);
    },
    enabled: !!imageIds && imageIds.length > 0,
  });
};
