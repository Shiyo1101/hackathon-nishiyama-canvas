import { beforeEach, describe, expect, test } from "vitest";
import { prisma } from "../../../lib/db";
import type { CreateThemeInput, UpdateThemeInput } from "../../../types/theme";
import { createThemeRepository, type ThemeRepository } from "../theme.repository";

describe("ThemeRepository", () => {
  let repository: ThemeRepository;

  beforeEach(async () => {
    repository = createThemeRepository(prisma);
    // テストデータのクリーンアップ
    await prisma.theme.deleteMany({
      where: {
        name: {
          contains: "Test Theme",
        },
      },
    });
  });

  describe("findAll", () => {
    test("全てのテーマを取得できる", async () => {
      const themes = await repository.findAll();

      expect(themes).toBeDefined();
      expect(Array.isArray(themes)).toBe(true);
    });
  });

  describe("findById", () => {
    test("IDでテーマを取得できる", async () => {
      // テストデータを作成
      const createInput: CreateThemeInput = {
        name: "Test Theme for FindById",
        fontFamily: "Arial",
        primaryColor: "#FF0000",
        secondaryColor: "#00FF00",
        backgroundColor: "#FFFFFF",
        isDefault: false,
      };

      const createdTheme = await repository.create(createInput);

      const theme = await repository.findById(createdTheme.id);

      expect(theme).toBeDefined();
      expect(theme?.id).toBe(createdTheme.id);
    });

    test("存在しないIDの場合nullを返す", async () => {
      const theme = await repository.findById("non-existent-id");

      expect(theme).toBeNull();
    });
  });

  describe("findDefault", () => {
    test("デフォルトテーマを取得できる", async () => {
      // デフォルトテーマを作成
      const createInput: CreateThemeInput = {
        name: "Default Test Theme",
        fontFamily: "Arial",
        primaryColor: "#FF0000",
        secondaryColor: "#00FF00",
        backgroundColor: "#FFFFFF",
        isDefault: true,
      };

      await repository.create(createInput);

      const defaultTheme = await repository.findDefault();

      expect(defaultTheme).toBeDefined();
      expect(defaultTheme?.isDefault).toBe(true);
    });
  });

  describe("create", () => {
    test("テーマを作成できる", async () => {
      const input: CreateThemeInput = {
        name: "Test Theme 1",
        fontFamily: "Arial",
        primaryColor: "#FF0000",
        secondaryColor: "#00FF00",
        backgroundColor: "#FFFFFF",
        isDefault: false,
      };

      const theme = await repository.create(input);

      expect(theme).toBeDefined();
      expect(theme.name).toBe(input.name);
      expect(theme.fontFamily).toBe(input.fontFamily);
      expect(theme.primaryColor).toBe(input.primaryColor);
      expect(theme.secondaryColor).toBe(input.secondaryColor);
      expect(theme.backgroundColor).toBe(input.backgroundColor);
      expect(theme.isDefault).toBe(false);
    });

    test("デフォルトテーマを作成すると既存のデフォルトが解除される", async () => {
      const input: CreateThemeInput = {
        name: "Test Theme 2",
        fontFamily: "Arial",
        primaryColor: "#FF0000",
        secondaryColor: "#00FF00",
        backgroundColor: "#FFFFFF",
        isDefault: true,
      };

      const newDefaultTheme = await repository.create(input);

      expect(newDefaultTheme.isDefault).toBe(true);

      // 既存のデフォルトテーマがすべて解除されているか確認
      const themes = await repository.findAll();
      const defaultThemes = themes.filter((t) => t.isDefault);

      expect(defaultThemes.length).toBe(1);
      expect(defaultThemes[0]?.id).toBe(newDefaultTheme.id);
    });
  });

  describe("update", () => {
    test("テーマを更新できる", async () => {
      const createInput: CreateThemeInput = {
        name: "Test Theme 3",
        fontFamily: "Arial",
        primaryColor: "#FF0000",
        secondaryColor: "#00FF00",
        backgroundColor: "#FFFFFF",
        isDefault: false,
      };

      const theme = await repository.create(createInput);

      const updateInput: UpdateThemeInput = {
        name: "Updated Test Theme 3",
        primaryColor: "#0000FF",
      };

      const updatedTheme = await repository.update(theme.id, updateInput);

      expect(updatedTheme.name).toBe(updateInput.name);
      expect(updatedTheme.primaryColor).toBe(updateInput.primaryColor);
      expect(updatedTheme.secondaryColor).toBe(createInput.secondaryColor);
    });
  });

  describe("delete", () => {
    test("テーマを削除できる", async () => {
      const input: CreateThemeInput = {
        name: "Test Theme 4",
        fontFamily: "Arial",
        primaryColor: "#FF0000",
        secondaryColor: "#00FF00",
        backgroundColor: "#FFFFFF",
        isDefault: false,
      };

      const theme = await repository.create(input);

      await repository.delete(theme.id);

      const deletedTheme = await repository.findById(theme.id);
      expect(deletedTheme).toBeNull();
    });
  });
});
