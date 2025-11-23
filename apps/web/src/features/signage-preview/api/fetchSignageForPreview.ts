/**
 * プレビュー用のサイネージデータ取得
 */

import type { SerializedSignage } from "@api";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api-client";
import type { LayoutConfig } from "@/types";

/**
 * ユーザーのサイネージを取得（プレビュー用）
 *
 * Note: バックエンドのlayoutConfigはZodスキーマから生成されているため、
 * フロントエンドの型定義と若干異なる可能性がある
 * そのため、フロントエンド側で型アサーションを行う
 */
export const fetchSignageForPreview = async (): Promise<
  SerializedSignage & { layoutConfig: LayoutConfig }
> => {
  // Next.jsのサーバーコンポーネントからCookieを取得して転送（認証情報）
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const response = await apiClient.signages.me.$get(
    {},
    {
      headers: {
        Cookie: cookieHeader,
      },
    },
  );

  if (!response.ok) {
    throw new Error("サイネージの取得に失敗しました");
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error("サイネージの取得に失敗しました");
  }

  // フロントエンド側のLayoutConfig型に変換
  return {
    ...data.data.signage,
    layoutConfig: data.data.signage.layoutConfig as unknown as LayoutConfig,
  };
};
