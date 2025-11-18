import type { Animal, AnimalImage } from "../../lib/db";
import type { AnimalFilter, AnimalImageFilter, AnimalsRepository } from "./animals.repository";

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
});
