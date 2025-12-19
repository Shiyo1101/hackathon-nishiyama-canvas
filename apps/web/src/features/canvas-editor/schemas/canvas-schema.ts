import { UpdateCanvasRequestSchema } from "@api/modules/canvas/canvas.schemas";
import { z } from "zod";

/**
 * キャンバス更新フォームのZodスキーマ
 *
 * バックエンドの UpdateCanvasRequestSchema から必要なフィールドのみを抽出し、
 * フロントエンド用のバリデーションルールとエラーメッセージを追加
 */
export const UpdateCanvasFormSchema = UpdateCanvasRequestSchema.pick({
  title: true,
  description: true,
  isPublic: true,
}).superRefine((data, ctx) => {
  // タイトルの最小文字数チェック（バックエンドは min(1) だが、フロントエンドは min(3) を要求）
  if (data.title && data.title.length < 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      minimum: 3,
      type: "string",
      inclusive: true,
      message: "タイトルは3文字以上で入力してください",
      path: ["title"],
    });
  }
});

export type UpdateCanvasFormValues = z.infer<typeof UpdateCanvasFormSchema>;
