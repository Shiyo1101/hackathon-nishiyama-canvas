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
/**
 * 動物作成入力
 */
export type CreateAnimalInput = {
  name: string;
  species: string;
  description?: string;
  habitat?: string;
  diet?: string;
  status?: AnimalStatus;
};

/**
 * 動物更新入力
 */
export type UpdateAnimalInput = {
  name?: string;
  species?: string;
  description?: string;
  habitat?: string;
  diet?: string;
  status?: AnimalStatus;
};

/**
 * 動物画像作成入力
 */
export type CreateAnimalImageInput = {
  animalId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  isFeatured?: boolean;
};

/**
 * 動物画像更新入力
 */
export type UpdateAnimalImageInput = {
  imageUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
  isFeatured?: boolean;
};

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

  /**
   * 動物を作成（管理者のみ）
   */
  createAnimal: (input: CreateAnimalInput) => Promise<Animal>;

  /**
   * 動物を更新（管理者のみ）
   */
  updateAnimal: (id: string, input: UpdateAnimalInput) => Promise<Animal>;

  /**
   * 動物を削除（管理者のみ）
   */
  deleteAnimal: (id: string) => Promise<void>;

  /**
   * 動物画像を作成（管理者のみ）
   */
  createAnimalImage: (input: CreateAnimalImageInput) => Promise<AnimalImage>;

  /**
   * 動物画像を更新（管理者のみ）
   */
  updateAnimalImage: (id: string, input: UpdateAnimalImageInput) => Promise<AnimalImage>;

  /**
   * 動物画像を削除（管理者のみ）
   */
  deleteAnimalImage: (id: string) => Promise<void>;
};

/**
 * 動物Repositoryのファクトリー関数
 */
export const createAnimalsRepository = (prisma: PrismaClient): AnimalsRepository => ({
  findManyAnimals: async (filter?: AnimalFilter): Promise<Animal[]> => {
    const { status = "active", limit = 20, offset = 0 } = filter ?? {};

    return prisma.animal.findMany({
      where: { status },
      include: {
        animalImages: {
          orderBy: { isFeatured: "desc" },
        },
      },
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

  createAnimal: async (input: CreateAnimalInput): Promise<Animal> => {
    return prisma.animal.create({
      data: {
        name: input.name,
        species: input.species,
        description: input.description,
        habitat: input.habitat,
        diet: input.diet,
        status: input.status ?? "active",
      },
    });
  },

  updateAnimal: async (id: string, input: UpdateAnimalInput): Promise<Animal> => {
    return prisma.animal.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.species !== undefined && { species: input.species }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.habitat !== undefined && { habitat: input.habitat }),
        ...(input.diet !== undefined && { diet: input.diet }),
        ...(input.status !== undefined && { status: input.status }),
      },
    });
  },

  deleteAnimal: async (id: string): Promise<void> => {
    await prisma.animal.delete({
      where: { id },
    });
  },

  createAnimalImage: async (input: CreateAnimalImageInput): Promise<AnimalImage> => {
    return prisma.animalImage.create({
      data: {
        animalId: input.animalId,
        imageUrl: input.imageUrl,
        thumbnailUrl: input.thumbnailUrl,
        caption: input.caption,
        isFeatured: input.isFeatured ?? false,
      },
    });
  },

  updateAnimalImage: async (id: string, input: UpdateAnimalImageInput): Promise<AnimalImage> => {
    return prisma.animalImage.update({
      where: { id },
      data: {
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
        ...(input.thumbnailUrl !== undefined && { thumbnailUrl: input.thumbnailUrl }),
        ...(input.caption !== undefined && { caption: input.caption }),
        ...(input.isFeatured !== undefined && { isFeatured: input.isFeatured }),
      },
    });
  },

  deleteAnimalImage: async (id: string): Promise<void> => {
    await prisma.animalImage.delete({
      where: { id },
    });
  },
});
