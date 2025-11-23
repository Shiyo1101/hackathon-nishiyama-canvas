import type { Animal, AnimalImage } from "../../lib/db";
import type {
  AnimalFilter,
  AnimalImageFilter,
  AnimalsRepository,
  CreateAnimalImageInput,
  CreateAnimalInput,
  UpdateAnimalImageInput,
  UpdateAnimalInput,
} from "./animals.repository";

/**
 * 動物一覧のレスポンス型
 */
export type AnimalsListResponse = {
  animals: Animal[];
  total: number;
  limit: number;
  offset: number;
};

/**
 * 動物画像一覧のレスポンス型
 */
export type AnimalImagesListResponse = {
  images: AnimalImage[];
  total: number;
  limit: number;
  offset: number;
};

/**
 * 動物Serviceの型定義
 */
export type AnimalsService = {
  /**
   * 動物一覧を取得
   */
  getAnimalsList: (filter?: AnimalFilter) => Promise<AnimalsListResponse>;

  /**
   * 動物詳細を取得
   */
  getAnimalById: (id: string) => Promise<Animal | null>;

  /**
   * 動物の画像一覧を取得
   */
  getAnimalImages: (
    animalId: string,
    filter?: AnimalImageFilter,
  ) => Promise<AnimalImagesListResponse>;

  /**
   * 動物画像詳細を取得
   */
  getAnimalImageById: (id: string) => Promise<AnimalImage | null>;

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
 * 動物Serviceのファクトリー関数
 */
export const createAnimalsService = (animalsRepository: AnimalsRepository): AnimalsService => ({
  getAnimalsList: async (filter?: AnimalFilter): Promise<AnimalsListResponse> => {
    const { limit = 20, offset = 0, status } = filter ?? {};

    const [animals, total] = await Promise.all([
      animalsRepository.findManyAnimals(filter),
      animalsRepository.countAnimals(status),
    ]);

    return {
      animals,
      total,
      limit,
      offset,
    };
  },

  getAnimalById: async (id: string): Promise<Animal | null> => {
    return animalsRepository.findAnimalById(id);
  },

  getAnimalImages: async (
    animalId: string,
    filter?: AnimalImageFilter,
  ): Promise<AnimalImagesListResponse> => {
    const { limit = 20, offset = 0, isFeatured } = filter ?? {};

    const [images, total] = await Promise.all([
      animalsRepository.findAnimalImages(animalId, filter),
      animalsRepository.countAnimalImages(animalId, isFeatured),
    ]);

    return {
      images,
      total,
      limit,
      offset,
    };
  },

  getAnimalImageById: async (id: string): Promise<AnimalImage | null> => {
    return animalsRepository.findAnimalImageById(id);
  },

  createAnimal: async (input: CreateAnimalInput): Promise<Animal> => {
    return animalsRepository.createAnimal(input);
  },

  updateAnimal: async (id: string, input: UpdateAnimalInput): Promise<Animal> => {
    const existingAnimal = await animalsRepository.findAnimalById(id);
    if (!existingAnimal) {
      throw new Error("動物が見つかりません");
    }

    return animalsRepository.updateAnimal(id, input);
  },

  deleteAnimal: async (id: string): Promise<void> => {
    const existingAnimal = await animalsRepository.findAnimalById(id);
    if (!existingAnimal) {
      throw new Error("動物が見つかりません");
    }

    await animalsRepository.deleteAnimal(id);
  },

  createAnimalImage: async (input: CreateAnimalImageInput): Promise<AnimalImage> => {
    const existingAnimal = await animalsRepository.findAnimalById(input.animalId);
    if (!existingAnimal) {
      throw new Error("動物が見つかりません");
    }

    return animalsRepository.createAnimalImage(input);
  },

  updateAnimalImage: async (id: string, input: UpdateAnimalImageInput): Promise<AnimalImage> => {
    const existingImage = await animalsRepository.findAnimalImageById(id);
    if (!existingImage) {
      throw new Error("動物画像が見つかりません");
    }

    return animalsRepository.updateAnimalImage(id, input);
  },

  deleteAnimalImage: async (id: string): Promise<void> => {
    const existingImage = await animalsRepository.findAnimalImageById(id);
    if (!existingImage) {
      throw new Error("動物画像が見つかりません");
    }

    await animalsRepository.deleteAnimalImage(id);
  },
});
