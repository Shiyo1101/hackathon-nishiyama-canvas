/**
 * サイネージバリデーションスキーマ
 */

import { z } from "zod";

/**
 * レイアウト設定スキーマ
 */
export const layoutConfigSchema = z.object({
  template_id: z.string().min(1, "テンプレートIDは必須です"),
  background: z.object({
    type: z.enum(["color", "image"], {
      errorMap: () => ({ message: "背景タイプはcolorまたはimageである必要があります" }),
    }),
    color: z.string().optional(),
    url: z.string().url("有効なURLを指定してください").optional(),
  }),
  grid: z
    .object({
      columns: z.number().int().min(1).max(24, "列数は1〜24の範囲で指定してください"),
      rows: z.number().int().min(1).max(24, "行数は1〜24の範囲で指定してください"),
    })
    .optional(),
  items: z.array(
    z.object({
      id: z.string().min(1),
      type: z.enum(["news", "animal", "text", "image", "user_image"], {
        errorMap: () => ({
          message:
            "アイテムタイプはnews、animal、text、image、user_imageのいずれかである必要があります",
        }),
      }),
      position: z.object({
        x: z.number().int().min(0),
        y: z.number().int().min(0),
        w: z.number().int().min(1),
        h: z.number().int().min(1),
      }),
      contentId: z.string().optional(),
      settings: z.record(z.unknown()).optional(),
    }),
  ),
});

/**
 * サイネージ作成スキーマ
 */
export const createSignageSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(255, "タイトルは255文字以内で指定してください"),
  description: z.string().max(1000, "説明は1000文字以内で指定してください").optional(),
  slug: z
    .string()
    .min(3, "スラッグは3文字以上で指定してください")
    .max(50, "スラッグは50文字以内で指定してください")
    .regex(/^[a-z0-9-]+$/, "スラッグは英小文字、数字、ハイフンのみ使用できます"),
  layoutConfig: layoutConfigSchema,
});

/**
 * サイネージ更新スキーマ
 */
export const updateSignageSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(255, "タイトルは255文字以内で指定してください")
    .optional(),
  description: z.string().max(1000, "説明は1000文字以内で指定してください").optional(),
  layoutConfig: layoutConfigSchema.optional(),
});

/**
 * 公開設定スキーマ
 */
export const publishSignageSchema = z.object({
  isPublic: z.boolean({
    required_error: "公開設定は必須です",
    invalid_type_error: "公開設定はboolean型である必要があります",
  }),
});

/**
 * 型定義
 */
export type LayoutConfig = z.infer<typeof layoutConfigSchema>;
export type CreateSignageInput = z.infer<typeof createSignageSchema>;
export type UpdateSignageInput = z.infer<typeof updateSignageSchema>;
export type PublishSignageInput = z.infer<typeof publishSignageSchema>;
