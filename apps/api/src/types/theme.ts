import { z } from "zod";

/**
 * テーマ型定義
 */
export const themeSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(255),
  fontFamily: z.string().min(1).max(255),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  isDefault: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Theme = z.infer<typeof themeSchema>;

/**
 * テーマ作成時のバリデーションスキーマ
 */
export const createThemeSchema = z.object({
  name: z.string().min(1).max(255),
  fontFamily: z.string().min(1).max(255),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  isDefault: z.boolean().optional().default(false),
});

export type CreateThemeInput = z.infer<typeof createThemeSchema>;

/**
 * テーマ更新時のバリデーションスキーマ
 */
export const updateThemeSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  fontFamily: z.string().min(1).max(255).optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .optional(),
  backgroundColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateThemeInput = z.infer<typeof updateThemeSchema>;

/**
 * テーマレスポンス型（クライアント向け）
 */
export const themeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  fontFamily: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  backgroundColor: z.string(),
  isDefault: z.boolean(),
});

export type ThemeResponse = z.infer<typeof themeResponseSchema>;
