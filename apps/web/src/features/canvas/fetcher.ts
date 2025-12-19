import "server-only";

import type {
  GetFavoriteCanvasesResponse,
  GetPopularCanvasesResponse,
  GetUserCanvasResponse,
  SerializedCanvas,
} from "@api";
import { cookies } from "next/headers";
import { cache } from "react";
import { apiClient } from "@/lib/api-client";

/**
 * 自分のキャンバス情報を取得
 *
 * サーバーコンポーネント専用の関数
 * React の cache でリクエスト内でメモ化される
 *
 * @returns キャンバス情報（存在しない場合やエラー時は null）
 * @throws エラーが発生した場合はログ出力して null を返す
 *
 * @example
 * ```tsx
 * // Server Component
 * import { fetchMyCanvas } from "@/features/canvas/fetcher";
 *
 * export default async function CanvasEditorPage() {
 *   const canvas = await fetchMyCanvas();
 *
 *   if (!canvas) {
 *     return <div>キャンバスが見つかりません</div>;
 *   }
 *
 *   return <CanvasEditor canvas={canvas} />;
 * }
 * ```
 */
export const fetchMyCanvas = cache(async (): Promise<SerializedCanvas | null> => {
  try {
    // Next.jsのサーバーコンポーネントからCookieを取得して転送
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const res = await apiClient.canvases.me.$get(
      {},
      {
        headers: {
          Cookie: cookieHeader,
        },
      },
    );

    if (!res.ok) {
      // 404はキャンバス未作成の正常なケースなのでエラーログを出さない
      if (res.status !== 404) {
        console.error("Failed to fetch canvas: HTTP", res.status);
      }
      return null;
    }

    const data = (await res.json()) as GetUserCanvasResponse;

    // 型ガードで成功/失敗を判定
    if (data.success) {
      return data.data.canvas;
    }

    console.error("Failed to fetch canvas:", data.error);
    return null;
  } catch (error) {
    console.error("Failed to fetch my canvas:", error);
    return null;
  }
});

/**
 * 人気の公開キャンバス一覧を取得
 *
 * サーバーコンポーネント専用の関数
 * React の cache でリクエスト内でメモ化される
 *
 * @param limit 取得件数（デフォルト: 10）
 * @returns 人気キャンバスの配列（エラー時は空配列）
 * @throws エラーが発生した場合はログ出力して空配列を返す
 *
 * @example
 * ```tsx
 * // Server Component
 * import { fetchPopularCanvass } from "@/features/canvas/fetcher";
 *
 * export default async function PopularCanvassPage() {
 *   const canvases = await fetchPopularCanvass(5);
 *
 *   return (
 *     <div>
 *       {canvases.map((canvas) => (
 *         <CanvasCard key={canvas.id} canvas={canvas} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const fetchPopularCanvass = cache(async (limit = 10): Promise<SerializedCanvas[]> => {
  try {
    const res = await apiClient.public.canvases.popular.$get({
      query: { limit: limit.toString() },
    });

    if (!res.ok) {
      console.error("Failed to fetch popular canvases: HTTP", res.status);
      return [];
    }

    const data = (await res.json()) as GetPopularCanvasesResponse;

    // 型ガードで成功/失敗を判定
    if (data.success) {
      return data.data.canvases;
    }

    console.error("Failed to fetch popular canvases:", data.error);
    return [];
  } catch (error) {
    console.error("Failed to fetch popular canvases:", error);
    return [];
  }
});

/**
 * お気に入りキャンバス一覧を取得
 *
 * サーバーコンポーネント専用の関数
 * React の cache でリクエスト内でメモ化される
 *
 * @param limit 取得件数（デフォルト: 10）
 * @returns お気に入りキャンバスの配列（エラー時は空配列）
 * @throws エラーが発生した場合はログ出力して空配列を返す
 *
 * @example
 * ```tsx
 * // Server Component
 * import { fetchFavoriteCanvass } from "@/features/canvas/fetcher";
 *
 * export default async function FavoriteCanvassPage() {
 *   const canvases = await fetchFavoriteCanvass(5);
 *
 *   return (
 *     <div>
 *       {canvases.map((canvas) => (
 *         <CanvasCard key={canvas.id} canvas={canvas} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const fetchFavoriteCanvass = cache(async (limit = 10): Promise<SerializedCanvas[]> => {
  try {
    // Next.jsのサーバーコンポーネントからCookieを取得して転送
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const res = await apiClient.favorites.$get(
      {
        query: { limit: limit.toString() },
      },
      {
        headers: {
          Cookie: cookieHeader,
        },
      },
    );

    if (!res.ok) {
      console.error("Failed to fetch favorite canvases: HTTP", res.status);
      return [];
    }

    const data = (await res.json()) as GetFavoriteCanvasesResponse;

    // 型ガードで成功/失敗を判定
    if (data.success) {
      return data.data.canvases;
    }

    console.error("Failed to fetch favorite canvases:", data.error);
    return [];
  } catch (error) {
    console.error("Failed to fetch favorite canvases:", error);
    return [];
  }
});
