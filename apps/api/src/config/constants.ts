/**
 * ビジネスルールの定数管理
 *
 * アプリケーション全体で使用されるビジネスルールの定数を一元管理
 */

/**
 * プラン別の制限値
 *
 * Phase 1: 無料プランのみ
 * Phase 2: 将来的に有料プランを追加予定
 */
export const PLAN_LIMITS = {
  /**
   * 無料プラン
   */
  FREE: {
    /** 作成可能なキャンバス数 */
    MAX_CANVASES: 1,
    /** ストレージ容量（MB） */
    MAX_STORAGE_MB: 100,
  },
  /**
   * Proプラン（将来実装予定）
   */
  PRO: {
    /** 作成可能なキャンバス数 */
    MAX_CANVASES: 10,
    /** ストレージ容量（MB） */
    MAX_STORAGE_MB: 1000,
  },
} as const;

/**
 * 画像アップロード制限
 */
export const UPLOAD_LIMITS = {
  /** 最大ファイルサイズ（バイト） */
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  /** 許可される画像フォーマット */
  ALLOWED_FORMATS: ["image/png", "image/jpeg", "image/jpg"] as const,
} as const;

/**
 * ページネーション設定
 */
export const PAGINATION = {
  /** デフォルトのページサイズ */
  DEFAULT_PAGE_SIZE: 20,
  /** 最大ページサイズ */
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * キャンバス表示設定
 */
export const CANVAS_DISPLAY = {
  /** 人気キャンバスの表示件数 */
  POPULAR_LIMIT: 10,
  /** お気に入りキャンバスのデフォルト表示件数 */
  FAVORITES_DEFAULT_LIMIT: 10,
} as const;
