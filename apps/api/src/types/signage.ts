/**
 * サイネージ関連の型定義
 */

import type { LayoutConfig } from "./validation";

// レイアウトアイテムのタイプ
export const LayoutItemType = {
  NEWS: "news",
  ANIMAL: "animal",
  TEXT: "text",
  IMAGE: "image",
  USER_IMAGE: "user_image",
} as const;

export type LayoutItemTypeValue = (typeof LayoutItemType)[keyof typeof LayoutItemType];

// 背景タイプ
export const BackgroundType = {
  COLOR: "color",
  IMAGE: "image",
} as const;

export type BackgroundTypeValue = (typeof BackgroundType)[keyof typeof BackgroundType];

// レイアウトアイテム
export interface LayoutItem {
  id: string;
  type: LayoutItemTypeValue;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  contentId?: string;
  settings?: Record<string, unknown>;
}

// サイネージ
export interface Signage {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  layoutConfig: LayoutConfig;
  isPublic: boolean;
  slug: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// サイネージ作成リクエスト
export interface CreateSignageRequest {
  title: string;
  description?: string;
  layoutConfig: LayoutConfig;
  slug: string;
}

// サイネージ更新リクエスト
export interface UpdateSignageRequest {
  title?: string;
  description?: string;
  layoutConfig?: LayoutConfig;
}

// 公開/非公開切り替えリクエスト
export interface PublishSignageRequest {
  isPublic: boolean;
}
