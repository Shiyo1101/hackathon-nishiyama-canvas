import type { Animal, AnimalImage, AnimalStatus, PrismaClient } from "../../lib/db";

/**
 * 動物フィルタ条件
 */
export type AnimalFilter = {
  status?: AnimalStatus;
  limit?: number;
  offset?: number;
};

/**
 * 動物画像フィルタ条件
 */
export type AnimalImageFilter = {
  limit?: number;
  offset?: number;
  isFeatured?: boolean;
};

/**
 * 動物Repositoryの型定義
 */
export type AnimalsRepository = {
  /**
   * 動物一覧を取得
   */
  findManyAnimals: (filter?: AnimalFilter) => Promise<Animal[]>;

  /**
   * IDで動物を取得
   */
  findAnimalById: (id: string) => Promise<Animal | null>;

  /**
   * 動物の総数を取得
   */
  countAnimals: (status?: AnimalStatus) => Promise<number>;

  /**
   * 動物の画像一覧を取得
   */
  findAnimalImages: (animalId: string, filter?: AnimalImageFilter) => Promise<AnimalImage[]>;

  /**
   * 動物画像の総数を取得
   */
  countAnimalImages: (animalId: string, isFeatured?: boolean) => Promise<number>;

  /**
   * IDで動物画像を取得
   */
  findAnimalImageById: (id: string) => Promise<AnimalImage | null>;
};

/**
 * 動物Repositoryのファクトリー関数
 */
export const createAnimalsRepository = (prisma: PrismaClient): AnimalsRepository => ({
  findManyAnimals: async (filter?: AnimalFilter): Promise<Animal[]> => {
    const { status = "active", limit = 20, offset = 0 } = filter ?? {};

    return prisma.animal.findMany({
      where: { status },
      orderBy: { name: "asc" },
      take: limit,
      skip: offset,
    });
  },

  findAnimalById: async (id: string): Promise<Animal | null> => {
    return prisma.animal.findUnique({
      where: { id },
    });
  },

  countAnimals: async (status?: AnimalStatus): Promise<number> => {
    return prisma.animal.count({
      where: status ? { status } : undefined,
    });
  },

  findAnimalImages: async (
    animalId: string,
    filter?: AnimalImageFilter,
  ): Promise<AnimalImage[]> => {
    const { limit = 20, offset = 0, isFeatured } = filter ?? {};

    return prisma.animalImage.findMany({
      where: {
        animalId,
        ...(isFeatured !== undefined && { isFeatured }),
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: limit,
      skip: offset,
    });
  },

  countAnimalImages: async (animalId: string, isFeatured?: boolean): Promise<number> => {
    return prisma.animalImage.count({
      where: {
        animalId,
        ...(isFeatured !== undefined && { isFeatured }),
      },
    });
  },

  findAnimalImageById: async (id: string): Promise<AnimalImage | null> => {
    return prisma.animalImage.findUnique({
      where: { id },
    });
  },
});
