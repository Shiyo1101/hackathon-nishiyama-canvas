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
  | "user_image" // ユーザーアップロード画像
  | "weather" // 天気情報
  | "timer"; // タイマー

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
  /** 複数コンテンツID配列 (動物画像スライドショー用、最大3つ) */
  contentIds?: string[];
  /** テキストコンテンツ (type="text"の場合) */
  textContent?: string;
  /** 背景画像URL (type="timer"の場合、動物画像のURL) */
  backgroundImageUrl?: string;
  /** 自動更新フラグ (type="news"の場合、1時間ごとにポーリング) */
  autoRefresh?: boolean;
  /** スライドショー切り替え間隔 (ミリ秒、デフォルト: 5000) */
  slideshowInterval?: number;
  /** スタイル設定 */
  style?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    /** テキスト位置(横方向) */
    textAlign?: "left" | "center" | "right";
    /** テキスト位置(縦方向) */
    verticalAlign?: "top" | "center" | "bottom";
    /** 回転角度(度) */
    rotation?: number;
    /** 行の高さ */
    lineHeight?: string;
    /** 文字間隔 */
    letterSpacing?: string;
    /** タイマー専用: 時刻表示形式 */
    format?: "24h" | "12h";
    /** タイマー専用: 秒の表示有無 */
    showSeconds?: boolean;
    /** タイマー専用: グラデーションオーバーレイの有効/無効 (デフォルト: true) */
    overlayEnabled?: boolean;
    /** タイマー専用: グラデーションオーバーレイのカラー (HEXまたはRGB(A)形式、デフォルト: #000000) */
    overlayColor?: string;
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
