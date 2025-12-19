/**
 * Canvas Zodスキーマ定義
 *
 * フロントエンドと共有可能なスキーマのみを含む
 * Node.js専用の依存関係（auth, bcryptなど）をインポートしない
 */
import { z } from "zod";

/**
 * レイアウト設定スキーマ
 */
export const LayoutConfigSchema = z.object({
  template_id: z.string(),
  background: z.object({
    type: z.enum(["color", "image"]),
    color: z.string().optional(),
    url: z.string().optional(),
  }),
  grid: z
    .object({
      columns: z.number().int().min(1).max(24),
      rows: z.number().int().min(1).max(24),
    })
    .optional(),
  items: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["news", "animal", "text", "user_image", "weather", "timer"]),
      position: z.object({
        x: z.number().int().min(0),
        y: z.number().int().min(0),
        w: z.number().int().min(1),
        h: z.number().int().min(1),
      }),
      contentId: z.string().optional(),
      contentIds: z.array(z.string()).optional(), // スライドショー用の複数コンテンツID
      textContent: z.string().max(5000).optional(), // XSS対策: 最大文字数制限
      backgroundImageUrl: z.string().url().optional(), // タイマー背景画像URL
      slideshowInterval: z.number().int().min(1000).max(60000).optional(), // スライドショー切り替え間隔（ミリ秒）
      autoRefresh: z.boolean().optional(), // ニュースの自動更新
      style: z
        .object({
          fontSize: z
            .string()
            .regex(/^[\d.]+(?:px|em|rem|%)$/)
            .optional(), // 数値+単位のみ
          fontWeight: z.enum(["normal", "bold"]).optional(),
          color: z
            .string()
            .regex(/^#[0-9A-Fa-f]{3,8}$|^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/)
            .optional(), // HEXまたはRGB(A)のみ
          backgroundColor: z
            .string()
            .regex(/^#[0-9A-Fa-f]{3,8}$|^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/)
            .optional(),
          textAlign: z.enum(["left", "center", "right"]).optional(),
          verticalAlign: z.enum(["top", "center", "bottom"]).optional(),
          rotation: z.number().min(-360).max(360).optional(), // -360〜360度
          lineHeight: z
            .string()
            .regex(/^[\d.]+(?:px|em|rem|%)$/)
            .optional(),
          letterSpacing: z
            .string()
            .regex(/^[\d.]+(?:px|em|rem|%)$|^normal$/)
            .optional(),
          // タイマー専用設定
          format: z.enum(["24h", "12h"]).optional(), // 時刻表示形式
          showSeconds: z.boolean().optional(), // 秒の表示有無
          overlayEnabled: z.boolean().optional(), // グラデーションオーバーレイの有効/無効
          overlayColor: z
            .string()
            .regex(/^#[0-9A-Fa-f]{3,8}$|^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/)
            .optional(), // グラデーションオーバーレイのカラー
        })
        .optional(),
      settings: z.record(z.string(), z.unknown()).optional(),
    }),
  ),
});

/**
 * キャンバス作成リクエストスキーマ
 */
export const CreateCanvasRequestSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  layoutConfig: LayoutConfigSchema,
});

/**
 * キャンバス更新リクエストスキーマ
 */
export const UpdateCanvasRequestSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  layoutConfig: LayoutConfigSchema.optional(),
  thumbnailUrl: z.string().url().optional().nullable(),
  isPublic: z.boolean().optional(),
});

/**
 * キャンバス公開設定リクエストスキーマ
 */
export const PublishCanvasRequestSchema = z.object({
  isPublic: z.boolean(),
});

/**
 * 型定義（Zodスキーマから推論）
 */
export type LayoutConfig = z.infer<typeof LayoutConfigSchema>;
export type CreateCanvasInput = z.infer<typeof CreateCanvasRequestSchema>;
export type UpdateCanvasInput = z.infer<typeof UpdateCanvasRequestSchema>;
export type PublishCanvasInput = z.infer<typeof PublishCanvasRequestSchema>;
