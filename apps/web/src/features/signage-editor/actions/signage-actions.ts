"use server";

/**
 * サイネージエディター用のServer Actions
 *
 * Client Componentから呼び出せるServer側の処理
 */

import type { SerializedSignage } from "@api";
import { headers } from "next/headers";
import { apiClient } from "@/lib/api-client";
import type { LayoutConfig } from "@/types";

/**
 * サイネージを更新
 *
 * @param signageId - サイネージID
 * @param updateData - 更新データ
 * @returns 更新結果
 */
export const updateSignageAction = async (
  signageId: string,
  updateData: {
    title?: string;
    description?: string;
    layoutConfig?: LayoutConfig;
    thumbnailUrl?: string;
    isPublic?: boolean;
  },
): Promise<{ success: true; signage: SerializedSignage } | { success: false; error: string }> => {
  try {
    // Server ActionsではheadersにアクセスできるためHono RPCクライアントを使用可能
    const headersList = await headers();

    // 通常のfetch APIを使用（Hono RPCの型推論の制限を回避）
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/signages/${signageId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        cookie: headersList.get("cookie") ?? "",
      },
      credentials: "include",
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `サイネージの更新に失敗しました (${response.status}): ${errorText}`,
      };
    }

    const data = await response.json();
    if (!data.success) {
      return {
        success: false,
        error: "サイネージの更新に失敗しました",
      };
    }

    return {
      success: true,
      signage: data.data.signage,
    };
  } catch (error) {
    console.error("updateSignageAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラー",
    };
  }
};

/**
 * サイネージを作成
 *
 * @param createData - 作成データ
 * @returns 作成結果
 */
export const createSignageAction = async (createData: {
  title: string;
  description?: string;
  slug: string;
  layoutConfig: LayoutConfig;
}): Promise<{ success: true; signage: SerializedSignage } | { success: false; error: string }> => {
  try {
    const response = await apiClient.signages.$post({
      json: createData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `サイネージの作成に失敗しました: ${errorText}`,
      };
    }

    const data = await response.json();
    if (!data.success) {
      return {
        success: false,
        error: "サイネージの作成に失敗しました",
      };
    }

    return {
      success: true,
      signage: data.data.signage,
    };
  } catch (error) {
    console.error("createSignageAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラー",
    };
  }
};

/**
 * サイネージの公開状態を更新
 *
 * @param signageId - サイネージID
 * @param isPublic - 公開状態
 * @returns 更新結果
 */
export const updateSignagePublishStatusAction = async (
  signageId: string,
  isPublic: boolean,
): Promise<{ success: true; signage: SerializedSignage } | { success: false; error: string }> => {
  try {
    const headersList = await headers();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/signages/${signageId}/publish`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          cookie: headersList.get("cookie") ?? "",
        },
        credentials: "include",
        body: JSON.stringify({ isPublic }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `公開状態の更新に失敗しました (${response.status}): ${errorText}`,
      };
    }

    const data = await response.json();
    if (!data.success) {
      return {
        success: false,
        error: "公開状態の更新に失敗しました",
      };
    }

    return {
      success: true,
      signage: data.data.signage,
    };
  } catch (error) {
    console.error("updateSignagePublishStatusAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラー",
    };
  }
};
