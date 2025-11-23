import type { Theme } from "@prisma/client";
import { ForbiddenError, NotFoundError } from "../../lib/errors";
import type { CreateThemeInput, UpdateThemeInput } from "../../types/theme";
import type { ThemeRepository } from "./theme.repository";

export type ThemeService = {
  getAllThemes: () => Promise<Theme[]>;
  getThemeById: (id: string) => Promise<Theme>;
  getDefaultTheme: () => Promise<Theme>;
  createTheme: (input: CreateThemeInput) => Promise<Theme>;
  updateTheme: (id: string, input: UpdateThemeInput) => Promise<Theme>;
  deleteTheme: (id: string) => Promise<void>;
};

export const createThemeService = (repository: ThemeRepository): ThemeService => ({
  getAllThemes: async () => {
    return repository.findAll();
  },

  getThemeById: async (id: string) => {
    const theme = await repository.findById(id);

    if (!theme) {
      throw new NotFoundError("テーマが見つかりません");
    }

    return theme;
  },

  getDefaultTheme: async () => {
    const theme = await repository.findDefault();

    if (!theme) {
      throw new NotFoundError("デフォルトテーマが見つかりません");
    }

    return theme;
  },

  createTheme: async (input: CreateThemeInput) => {
    return repository.create(input);
  },

  updateTheme: async (id: string, input: UpdateThemeInput) => {
    // テーマの存在確認
    const existingTheme = await repository.findById(id);

    if (!existingTheme) {
      throw new NotFoundError("テーマが見つかりません");
    }

    return repository.update(id, input);
  },

  deleteTheme: async (id: string) => {
    // テーマの存在確認
    const existingTheme = await repository.findById(id);

    if (!existingTheme) {
      throw new NotFoundError("テーマが見つかりません");
    }

    // デフォルトテーマは削除できない
    if (existingTheme.isDefault) {
      throw new ForbiddenError("デフォルトテーマは削除できません");
    }

    await repository.delete(id);
  },
});
