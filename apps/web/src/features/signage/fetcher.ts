import "server-only";

import type {
  GetFavoriteSignagesResponse,
  GetPopularSignagesResponse,
  GetUserSignageResponse,
  SerializedSignage,
} from "@api";
import { cookies } from "next/headers";
import { cache } from "react";
import { apiClient } from "@/lib/api-client";

/**
 * 自分のサイネージ情報を取得
 *
 * サーバーコンポーネント専用の関数
 * React の cache でリクエスト内でメモ化される
 *
 * @returns サイネージ情報（存在しない場合やエラー時は null）
 * @throws エラーが発生した場合はログ出力して null を返す
 *
 * @example
 * ```tsx
 * // Server Component
 * import { fetchMySignage } from "@/features/signage/fetcher";
 *
 * export default async function SignageEditorPage() {
 *   const signage = await fetchMySignage();
 *
 *   if (!signage) {
 *     return <div>サイネージが見つかりません</div>;
 *   }
 *
 *   return <SignageEditor signage={signage} />;
 * }
 * ```
 */
export const fetchMySignage = cache(async (): Promise<SerializedSignage | null> => {
  try {
    // Next.jsのサーバーコンポーネントからCookieを取得して転送
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const res = await apiClient.signages.me.$get(
      {},
      {
        headers: {
          Cookie: cookieHeader,
        },
      },
    );

    if (!res.ok) {
      console.error("Failed to fetch signage: HTTP", res.status);
      return null;
    }

    const data = (await res.json()) as GetUserSignageResponse;

    // 型ガードで成功/失敗を判定
    if (data.success) {
      return data.data.signage;
    }

    console.error("Failed to fetch signage:", data.error);
    return null;
  } catch (error) {
    console.error("Failed to fetch my signage:", error);
    return null;
  }
});

/**
 * 人気の公開サイネージ一覧を取得
 *
 * サーバーコンポーネント専用の関数
 * React の cache でリクエスト内でメモ化される
 *
 * @param limit 取得件数（デフォルト: 10）
 * @returns 人気サイネージの配列（エラー時は空配列）
 * @throws エラーが発生した場合はログ出力して空配列を返す
 *
 * @example
 * ```tsx
 * // Server Component
 * import { fetchPopularSignages } from "@/features/signage/fetcher";
 *
 * export default async function PopularSignagesPage() {
 *   const signages = await fetchPopularSignages(5);
 *
 *   return (
 *     <div>
 *       {signages.map((signage) => (
 *         <SignageCard key={signage.id} signage={signage} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const fetchPopularSignages = cache(async (limit = 10): Promise<SerializedSignage[]> => {
  try {
    const res = await apiClient.public.signages.popular.$get({
      query: { limit: limit.toString() },
    });

    if (!res.ok) {
      console.error("Failed to fetch popular signages: HTTP", res.status);
      return [];
    }

    const data = (await res.json()) as GetPopularSignagesResponse;

    // 型ガードで成功/失敗を判定
    if (data.success) {
      return data.data.signages;
    }

    console.error("Failed to fetch popular signages:", data.error);
    return [];
  } catch (error) {
    console.error("Failed to fetch popular signages:", error);
    return [];
  }
});

/**
 * お気に入りサイネージ一覧を取得
 *
 * サーバーコンポーネント専用の関数
 * React の cache でリクエスト内でメモ化される
 *
 * @param limit 取得件数（デフォルト: 10）
 * @returns お気に入りサイネージの配列（エラー時は空配列）
 * @throws エラーが発生した場合はログ出力して空配列を返す
 *
 * @example
 * ```tsx
 * // Server Component
 * import { fetchFavoriteSignages } from "@/features/signage/fetcher";
 *
 * export default async function FavoriteSignagesPage() {
 *   const signages = await fetchFavoriteSignages(5);
 *
 *   return (
 *     <div>
 *       {signages.map((signage) => (
 *         <SignageCard key={signage.id} signage={signage} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const fetchFavoriteSignages = cache(async (limit = 10): Promise<SerializedSignage[]> => {
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
      console.error("Failed to fetch favorite signages: HTTP", res.status);
      return [];
    }

    const data = (await res.json()) as GetFavoriteSignagesResponse;

    // 型ガードで成功/失敗を判定
    if (data.success) {
      return data.data.signages;
    }

    console.error("Failed to fetch favorite signages:", data.error);
    return [];
  } catch (error) {
    console.error("Failed to fetch favorite signages:", error);
    return [];
  }
});
