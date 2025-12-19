/**
 * キャンバスエディター用のAPIフェッチャー関数
 *
 * Hono RPCクライアントを使用して型安全にバックエンドAPIと通信
 *
 * NOTE: このファイルはServer Componentでのみ使用してください。
 * headers()を使用しているため、Client Componentでは動作しません。
 *
 * キャッシュ戦略:
 * - ユーザー固有データ: cache: "no-store" (常に最新)
 * - 公開データ: next: { revalidate: 60 } (1分ごと再検証)
 * - マスタデータ: デフォルト (めったに変更なし)
 */

import type { SerializedCanvas } from "@api";
import { headers } from "next/headers";
import { apiClient } from "@/lib/api-client";

/**
 * 自分のキャンバスを取得
 *
 * @throws {Error} キャンバスが存在しない、または取得に失敗した場合
 * @returns キャンバスデータ、または存在しない場合はnull
 */
export const fetchMyCanvas = async (): Promise<SerializedCanvas | null> => {
  const headersList = await headers();

  const response = await apiClient.canvases.me.$get(undefined, {
    init: {
      headers: headersList,
      credentials: "include",
    },
  });

  // 404の場合はキャンバスが存在しないのでnullを返す
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`キャンバスの取得に失敗しました (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error("キャンバスの取得に失敗しました");
  }

  return data.data.canvas;
};

/**
 * キャンバスを更新
 *
 * @param canvasId - キャンバスID
 * @param updateData - 更新データ
 * @throws {Error} 更新に失敗した場合
 */
export const updateCanvas = async (
  canvasId: string,
  updateData: {
    title?: string;
    description?: string;
    layoutConfig?: unknown;
  },
): Promise<SerializedCanvas> => {
  // 通常のfetch APIを使用（Hono RPCの型推論の制限を回避）
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/canvases/${canvasId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error("キャンバスの更新に失敗しました");
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error("キャンバスの更新に失敗しました");
  }

  return data.data.canvas;
};

/**
 * キャンバスを作成
 *
 * @param createData - 作成データ
 * @throws {Error} 作成に失敗した場合
 */
export const createCanvas = async (createData: {
  title: string;
  description?: string;
  slug: string;
  layoutConfig: unknown;
}): Promise<SerializedCanvas> => {
  const response = await apiClient.canvases.$post({
    json: createData,
  });

  if (!response.ok) {
    throw new Error("キャンバスの作成に失敗しました");
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error("キャンバスの作成に失敗しました");
  }

  return data.data.canvas;
};

/**
 * キャンバスの公開状態を更新
 *
 * @param canvasId - キャンバスID
 * @param isPublic - 公開状態
 * @throws {Error} 更新に失敗した場合
 */
export const updateCanvasPublishStatus = async (
  canvasId: string,
  isPublic: boolean,
): Promise<SerializedCanvas> => {
  // 通常のfetch APIを使用（Hono RPCの型推論の制限を回避）
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/canvases/${canvasId}/publish`,
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

  return data.data.canvas;
};

/**
 * ニュース一覧を取得
 *
 * @returns ニュース一覧
 * @throws {Error} 取得に失敗した場合
 */
export const fetchNewsList = async () => {
  // Hono RPCクライアントではfetchオプションを直接渡せないため、
  // Next.jsのfetch関数を使用してキャッシュ制御を行う
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news`, {
    credentials: "include",
    next: { revalidate: 60 }, // 1分ごとに再検証
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ニュース一覧の取得に失敗しました (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error("ニュース一覧の取得に失敗しました");
  }

  return data.data.news;
};

/**
 * ニュース詳細を取得
 *
 * @param newsId - ニュースID
 * @returns ニュース詳細
 * @throws {Error} 取得に失敗した場合
 */
export const fetchNewsById = async (newsId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${newsId}`, {
    credentials: "include",
    next: { revalidate: 60 }, // 1分ごとに再検証
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ニュースの取得に失敗しました (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error("ニュースの取得に失敗しました");
  }

  return data.data.news;
};

/**
 * 動物画像一覧を取得
 *
 * @returns 動物画像一覧
 * @throws {Error} 取得に失敗した場合
 */
export const fetchAnimalImages = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/animals/images`, {
    credentials: "include",
    next: { revalidate: 60 }, // 1分ごとに再検証
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`動物画像一覧の取得に失敗しました (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error("動物画像一覧の取得に失敗しました");
  }

  return data.data.images;
};

/**
 * 動物画像詳細を取得
 *
 * @param imageId - 画像ID
 * @returns 動物画像詳細
 * @throws {Error} 取得に失敗した場合
 */
export const fetchAnimalImageById = async (imageId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/animals/images/${imageId}`, {
    credentials: "include",
    next: { revalidate: 60 }, // 1分ごとに再検証
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`動物画像の取得に失敗しました (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error("動物画像の取得に失敗しました");
  }

  return data.data.image;
};

/**
 * 複数の動物画像を取得（スライドショー用）
 *
 * @param imageIds - 画像ID配列
 * @returns 動物画像配列
 * @throws {Error} 取得に失敗した場合
 */
export const fetchAnimalImagesByIds = async (imageIds: string[]) => {
  const promises = imageIds.map((id) => fetchAnimalImageById(id));
  return await Promise.all(promises);
};
