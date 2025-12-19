/**
 * プレビュー用のキャンバスデータ取得
 */

import type { SerializedCanvas } from "@api";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api-client";
import type { LayoutConfig } from "@/types";

/**
 * ユーザーのキャンバスを取得（プレビュー用）
 *
 * Note: バックエンドのlayoutConfigはZodスキーマから生成されているため、
 * フロントエンドの型定義と若干異なる可能性がある
 * そのため、フロントエンド側で型アサーションを行う
 */
export const fetchCanvasForPreview = async (): Promise<
  SerializedCanvas & { layoutConfig: LayoutConfig }
> => {
  // Next.jsのサーバーコンポーネントからCookieを取得して転送（認証情報）
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const response = await apiClient.canvases.me.$get(
    {},
    {
      headers: {
        Cookie: cookieHeader,
      },
    },
  );

  if (!response.ok) {
    throw new Error("キャンバスの取得に失敗しました");
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error("キャンバスの取得に失敗しました");
  }

  // フロントエンド側のLayoutConfig型に変換
  return {
    ...data.data.canvas,
    layoutConfig: data.data.canvas.layoutConfig as unknown as LayoutConfig,
  };
};
