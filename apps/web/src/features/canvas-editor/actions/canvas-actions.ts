"use server";

/**
 * キャンバスエディター用のServer Actions
 *
 * Client Componentから呼び出せるServer側の処理
 */

import type { SerializedCanvas } from "@api";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api-client";
import type { LayoutConfig } from "@/types";

/**
 * キャンバスを更新
 *
 * @param canvasId - キャンバスID
 * @param updateData - 更新データ
 * @returns 更新結果
 */
export const updateCanvasAction = async (
  canvasId: string,
  updateData: {
    title?: string;
    description?: string;
    layoutConfig?: LayoutConfig;
    thumbnailUrl?: string;
    isPublic?: boolean;
  },
): Promise<{ success: true; canvas: SerializedCanvas } | { success: false; error: string }> => {
  try {
    // Server ActionsではcookiesにアクセスできるためcookieをapiClientに渡す
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    // Hono RPC apiClientを使用（型安全）
    const response = await apiClient.canvases[":id"].$put(
      {
        param: { id: canvasId },
        json: updateData,
      } as never,
      {
        headers: {
          Cookie: cookieHeader,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `キャンバスの更新に失敗しました (${response.status}): ${errorText}`,
      };
    }

    const data = await response.json();
    if (!data.success) {
      return {
        success: false,
        error: "キャンバスの更新に失敗しました",
      };
    }

    // キャッシュを無効化してページを再検証
    revalidatePath("/canvas/edit");

    return {
      success: true,
      canvas: data.data.canvas,
    };
  } catch (error) {
    console.error("updateCanvasAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラー",
    };
  }
};

/**
 * キャンバスを作成
 *
 * @param createData - 作成データ
 * @returns 作成結果
 */
export const createCanvasAction = async (createData: {
  title: string;
  description?: string;
  slug: string;
  layoutConfig: LayoutConfig;
}): Promise<{ success: true; canvas: SerializedCanvas } | { success: false; error: string }> => {
  try {
    // Server ActionsではcookiesにアクセスできるためcookieをapiClientに渡す
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    // Hono RPC apiClientを使用（型安全）
    const response = await apiClient.canvases.$post(
      {
        json: createData as never,
      },
      {
        headers: {
          Cookie: cookieHeader,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `キャンバスの作成に失敗しました (${response.status}): ${errorText}`,
      };
    }

    const data = await response.json();
    if (!data.success) {
      return {
        success: false,
        error: "キャンバスの作成に失敗しました",
      };
    }

    // キャッシュを無効化してページを再検証
    revalidatePath("/canvas/edit");

    return {
      success: true,
      canvas: data.data.canvas,
    };
  } catch (error) {
    console.error("createCanvasAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラー",
    };
  }
};

/**
 * キャンバスの公開状態を更新
 *
 * @param canvasId - キャンバスID
 * @param isPublic - 公開状態
 * @returns 更新結果
 */
export const updateCanvasPublishStatusAction = async (
  canvasId: string,
  isPublic: boolean,
): Promise<{ success: true; canvas: SerializedCanvas } | { success: false; error: string }> => {
  try {
    // Server ActionsではcookiesにアクセスできるためcookieをapiClientに渡す
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    // Hono RPC apiClientを使用（型安全）
    const response = await apiClient.canvases[":id"].publish.$patch(
      {
        param: { id: canvasId },
        json: { isPublic },
      } as never,
      {
        headers: {
          Cookie: cookieHeader,
        },
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

    // キャッシュを無効化してページを再検証
    revalidatePath("/canvas/edit");

    return {
      success: true,
      canvas: data.data.canvas,
    };
  } catch (error) {
    console.error("updateCanvasPublishStatusAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラー",
    };
  }
};

/**
 * キャンバスを削除
 *
 * @param canvasId - キャンバスID
 * @returns 削除結果
 */
export const deleteCanvasAction = async (
  canvasId: string,
): Promise<{ success: true } | { success: false; error: string }> => {
  try {
    // Server ActionsではcookiesにアクセスできるためcookieをapiClientに渡す
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    // Hono RPC apiClientを使用（型安全）
    const response = await apiClient.canvases[":id"].$delete(
      {
        param: { id: canvasId },
      } as never,
      {
        headers: {
          Cookie: cookieHeader,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `キャンバスの削除に失敗しました (${response.status}): ${errorText}`,
      };
    }

    // キャッシュを無効化してページを再検証
    revalidatePath("/canvas/edit");

    return {
      success: true,
    };
  } catch (error) {
    console.error("deleteCanvasAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラー",
    };
  }
};

/**
 * ユーザー画像をアップロード
 *
 * @param formData - FormData（"file"キーで画像ファイルを含む）
 * @returns アップロード結果（画像IDとURL）
 */
export const uploadUserImageAction = async (
  formData: FormData,
): Promise<
  { success: true; imageId: string; imageUrl: string } | { success: false; error: string }
> => {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    // Hono RPCクライアントでは型定義が不完全なため、fetchを直接使用
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/content`, {
      method: "POST",
      headers: {
        Cookie: cookieHeader,
      },
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `画像のアップロードに失敗しました (${response.status}): ${errorText}`,
      };
    }

    const data = await response.json();
    if (!data.success) {
      return {
        success: false,
        error: "画像のアップロードに失敗しました",
      };
    }

    // キャッシュを無効化
    revalidatePath("/canvas/edit");

    return {
      success: true,
      imageId: data.data.image.id,
      imageUrl: data.data.image.url,
    };
  } catch (error) {
    console.error("uploadUserImageAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラー",
    };
  }
};

/**
 * サムネイル画像をアップロード
 *
 * @param formData - FormData（"file"キーで画像ファイルを含む）
 * @returns アップロード結果（画像URL）
 */
export const uploadThumbnailAction = async (
  formData: FormData,
): Promise<{ success: true; thumbnailUrl: string } | { success: false; error: string }> => {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    // Hono RPCクライアントでは型定義が不完全なため、fetchを直接使用
    // サムネイル画像も /api/upload/content エンドポイントを使用
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/content`, {
      method: "POST",
      headers: {
        Cookie: cookieHeader,
      },
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `サムネイル画像のアップロードに失敗しました (${response.status}): ${errorText}`,
      };
    }

    const data = await response.json();
    if (!data.success) {
      return {
        success: false,
        error: "サムネイル画像のアップロードに失敗しました",
      };
    }

    // キャッシュを無効化
    revalidatePath("/canvas/edit");

    return {
      success: true,
      thumbnailUrl: data.data.image.url,
    };
  } catch (error) {
    console.error("uploadThumbnailAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラー",
    };
  }
};
