import type { Theme } from "@prisma/client";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { CreateThemeInput, UpdateThemeInput } from "../../../types/theme";
import type { ThemeRepository } from "../theme.repository";
import { createThemeService, type ThemeService } from "../theme.service";

describe("ThemeService", () => {
  let service: ThemeService;
  let mockRepository: ThemeRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findDefault: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    service = createThemeService(mockRepository);
  });

  describe("getAllThemes", () => {
    test("全てのテーマを取得できる", async () => {
      const mockThemes: Theme[] = [
        {
          id: "1",
          name: "Theme 1",
          fontFamily: "Arial",
          primaryColor: "#FF0000",
          secondaryColor: "#00FF00",
          backgroundColor: "#FFFFFF",
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockThemes);

      const themes = await service.getAllThemes();

      expect(themes).toEqual(mockThemes);
      expect(mockRepository.findAll).toHaveBeenCalledOnce();
    });
  });

  describe("getThemeById", () => {
    test("IDでテーマを取得できる", async () => {
      const mockTheme: Theme = {
        id: "1",
        name: "Theme 1",
        fontFamily: "Arial",
        primaryColor: "#FF0000",
        secondaryColor: "#00FF00",
        backgroundColor: "#FFFFFF",
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(mockTheme);

      const theme = await service.getThemeById("1");

      expect(theme).toEqual(mockTheme);
      expect(mockRepository.findById).toHaveBeenCalledWith("1");
    });

    test("存在しないIDの場合エラーをスロー", async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(service.getThemeById("non-existent")).rejects.toThrow("テーマが見つかりません");
    });
  });

  describe("getDefaultTheme", () => {
    test("デフォルトテーマを取得できる", async () => {
      const mockTheme: Theme = {
        id: "1",
        name: "Default Theme",
        fontFamily: "Arial",
        primaryColor: "#FF0000",
        secondaryColor: "#00FF00",
        backgroundColor: "#FFFFFF",
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockRepository.findDefault).mockResolvedValue(mockTheme);

      const theme = await service.getDefaultTheme();

      expect(theme).toEqual(mockTheme);
      expect(mockRepository.findDefault).toHaveBeenCalledOnce();
    });

    test("デフォルトテーマが存在しない場合エラーをスロー", async () => {
      vi.mocked(mockRepository.findDefault).mockResolvedValue(null);

      await expect(service.getDefaultTheme()).rejects.toThrow("デフォルトテーマが見つかりません");
    });
  });

  describe("createTheme", () => {
    test("テーマを作成できる", async () => {
      const input: CreateThemeInput = {
        name: "New Theme",
        fontFamily: "Arial",
        primaryColor: "#FF0000",
        secondaryColor: "#00FF00",
        backgroundColor: "#FFFFFF",
        isDefault: false,
      };

      const mockTheme: Theme = {
        id: "1",
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockRepository.create).mockResolvedValue(mockTheme);

      const theme = await service.createTheme(input);

      expect(theme).toEqual(mockTheme);
      expect(mockRepository.create).toHaveBeenCalledWith(input);
    });
  });

  describe("updateTheme", () => {
    test("テーマを更新できる", async () => {
      const input: UpdateThemeInput = {
        name: "Updated Theme",
      };

      const existingTheme: Theme = {
        id: "1",
        name: "Old Theme",
        fontFamily: "Arial",
        primaryColor: "#FF0000",
        secondaryColor: "#00FF00",
        backgroundColor: "#FFFFFF",
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTheme: Theme = {
        ...existingTheme,
        name: "Updated Theme",
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(existingTheme);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedTheme);

      const theme = await service.updateTheme("1", input);

      expect(theme).toEqual(updatedTheme);
      expect(mockRepository.findById).toHaveBeenCalledWith("1");
      expect(mockRepository.update).toHaveBeenCalledWith("1", input);
    });

    test("存在しないテーマの場合エラーをスロー", async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(service.updateTheme("non-existent", {})).rejects.toThrow(
        "テーマが見つかりません",
      );
    });
  });

  describe("deleteTheme", () => {
    test("テーマを削除できる", async () => {
      const mockTheme: Theme = {
        id: "1",
        name: "Theme to Delete",
        fontFamily: "Arial",
        primaryColor: "#FF0000",
        secondaryColor: "#00FF00",
        backgroundColor: "#FFFFFF",
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(mockTheme);
      vi.mocked(mockRepository.delete).mockResolvedValue();

      await service.deleteTheme("1");

      expect(mockRepository.findById).toHaveBeenCalledWith("1");
      expect(mockRepository.delete).toHaveBeenCalledWith("1");
    });

    test("デフォルトテーマは削除できない", async () => {
      const mockTheme: Theme = {
        id: "1",
        name: "Default Theme",
        fontFamily: "Arial",
        primaryColor: "#FF0000",
        secondaryColor: "#00FF00",
        backgroundColor: "#FFFFFF",
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(mockTheme);

      await expect(service.deleteTheme("1")).rejects.toThrow("デフォルトテーマは削除できません");
    });

    test("存在しないテーマの場合エラーをスロー", async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(service.deleteTheme("non-existent")).rejects.toThrow("テーマが見つかりません");
    });
  });
});
