/**
 * サイネージレイアウトとテンプレートの型定義
 */

/**
 * グリッド位置情報
 */
export type GridPosition = {
  /** X座標 (グリッド単位) */
  x: number;
  /** Y座標 (グリッド単位) */
  y: number;
  /** 幅 (グリッド単位) */
  w: number;
  /** 高さ (グリッド単位) */
  h: number;
};

/**
 * コンテンツアイテムのタイプ
 */
export type ContentItemType =
  | "news" // ニュース
  | "animal" // 動物情報
  | "text" // テキスト
  | "image" // 公式画像
  | "user_image"; // ユーザーアップロード画像

/**
 * レイアウトアイテム
 */
export type LayoutItem = {
  /** アイテムの一意なID */
  id: string;
  /** コンテンツタイプ */
  type: ContentItemType;
  /** グリッド上の位置とサイズ */
  position: GridPosition;
  /** コンテンツID (データベース上のニュースIDや画像IDなど) */
  contentId?: string;
  /** テキストコンテンツ (type="text"の場合) */
  textContent?: string;
  /** スタイル設定 */
  style?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
  };
};

/**
 * 背景設定
 */
export type BackgroundConfig =
  | {
      type: "color";
      value: string; // CSS color値
    }
  | {
      type: "image";
      url: string; // 画像URL
    };

/**
 * グリッド設定
 */
export type GridConfig = {
  /** カラム数 */
  columns: number;
  /** 行数 */
  rows: number;
  /** グリッドのギャップ (px) */
  gap?: number;
};

/**
 * レイアウト設定
 */
export type LayoutConfig = {
  /** テンプレートID */
  templateId: string;
  /** 背景設定 */
  background: BackgroundConfig;
  /** グリッド設定 */
  grid: GridConfig;
  /** レイアウトアイテムの配列 */
  items: LayoutItem[];
};

/**
 * テンプレート
 */
export type SignageTemplate = {
  /** テンプレートID */
  id: string;
  /** テンプレート名 */
  name: string;
  /** テンプレートの説明 */
  description: string;
  /** サムネイル画像URL */
  thumbnailUrl: string;
  /** デフォルトのレイアウト設定 */
  defaultLayout: LayoutConfig;
};

/**
 * ドラッグアイテム (サイドバーからドラッグする際の型)
 */
export type DraggableItemData = {
  /** ドラッグ元のタイプ */
  source: "sidebar" | "grid";
  /** コンテンツタイプ */
  type: ContentItemType;
  /** コンテンツID (既存アイテムの場合) */
  contentId?: string;
  /** アイテムID (グリッド内のアイテムの場合) */
  itemId?: string;
};
