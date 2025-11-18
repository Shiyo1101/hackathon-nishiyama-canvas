import type { PrismaClient, Theme } from "@prisma/client";
import type { CreateThemeInput, UpdateThemeInput } from "../../types/theme";

export type ThemeRepository = {
  findAll: () => Promise<Theme[]>;
  findById: (id: string) => Promise<Theme | null>;
  findDefault: () => Promise<Theme | null>;
  create: (input: CreateThemeInput) => Promise<Theme>;
  update: (id: string, input: UpdateThemeInput) => Promise<Theme>;
  delete: (id: string) => Promise<void>;
};

export const createThemeRepository = (prisma: PrismaClient): ThemeRepository => ({
  findAll: async () => {
    return prisma.theme.findMany({
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  },

  findById: async (id: string) => {
    return prisma.theme.findUnique({
      where: { id },
    });
  },

  findDefault: async () => {
    return prisma.theme.findFirst({
      where: { isDefault: true },
    });
  },

  create: async (input: CreateThemeInput) => {
    // 新しいテーマをデフォルトにする場合、既存のデフォルトを解除
    if (input.isDefault) {
      await prisma.theme.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.theme.create({
      data: input,
    });
  },

  update: async (id: string, input: UpdateThemeInput) => {
    // デフォルトに設定する場合、既存のデフォルトを解除
    if (input.isDefault === true) {
      await prisma.theme.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.theme.update({
      where: { id },
      data: input,
    });
  },

  delete: async (id: string) => {
    await prisma.theme.delete({
      where: { id },
    });
  },
});
