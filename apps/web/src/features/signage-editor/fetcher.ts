/**
 * サイネージエディター用のAPIフェッチャー関数
 *
 * Hono RPCクライアントを使用して型安全にバックエンドAPIと通信
 *
 * NOTE: このファイルはServer Componentでのみ使用してください。
 * headers()を使用しているため、Client Componentでは動作しません。
 */

import type { SerializedSignage } from "@api";
import { headers } from "next/headers";
import { apiClient } from "@/lib/api-client";

/**
 * 自分のサイネージを取得
 *
 * @throws {Error} サイネージが存在しない、または取得に失敗した場合
 * @returns サイネージデータ、または存在しない場合はnull
 */
export const fetchMySignage = async (): Promise<SerializedSignage | null> => {
  const headersList = await headers();

  const response = await apiClient.signages.me.$get(undefined, {
    init: {
      headers: headersList,
      credentials: "include",
    },
  });

  // 404の場合はサイネージが存在しないのでnullを返す
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`サイネージの取得に失敗しました (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error("サイネージの取得に失敗しました");
  }

  return data.data.signage;
};

/**
 * サイネージを更新
 *
 * @param signageId - サイネージID
 * @param updateData - 更新データ
 * @throws {Error} 更新に失敗した場合
 */
export const updateSignage = async (
  signageId: string,
  updateData: {
    title?: string;
    description?: string;
    layoutConfig?: unknown;
  },
): Promise<SerializedSignage> => {
  // 通常のfetch APIを使用（Hono RPCの型推論の制限を回避）
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/signages/${signageId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error("サイネージの更新に失敗しました");
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error("サイネージの更新に失敗しました");
  }

  return data.data.signage;
};

/**
 * サイネージを作成
 *
 * @param createData - 作成データ
 * @throws {Error} 作成に失敗した場合
 */
export const createSignage = async (createData: {
  title: string;
  description?: string;
  slug: string;
  layoutConfig: unknown;
}): Promise<SerializedSignage> => {
  const response = await apiClient.signages.$post({
    json: createData,
  });

  if (!response.ok) {
    throw new Error("サイネージの作成に失敗しました");
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error("サイネージの作成に失敗しました");
  }

  return data.data.signage;
};

/**
 * サイネージの公開状態を更新
 *
 * @param signageId - サイネージID
 * @param isPublic - 公開状態
 * @throws {Error} 更新に失敗した場合
 */
export const updateSignagePublishStatus = async (
  signageId: string,
  isPublic: boolean,
): Promise<SerializedSignage> => {
  // 通常のfetch APIを使用（Hono RPCの型推論の制限を回避）
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/signages/${signageId}/publish`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ isPublic }),
    },
  );

  if (!response.ok) {
    throw new Error("公開状態の更新に失敗しました");
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error("公開状態の更新に失敗しました");
  }

  return data.data.signage;
};
