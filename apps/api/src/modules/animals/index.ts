/**
 * 動物モジュール
 * @module animals
 */

import type { Animal as PrismaAnimal, AnimalImage as PrismaAnimalImage } from "@prisma/client";

/**
 * シリアライズされたAnimalImage型
 * JSONレスポンスではDateTimeがstring型に変換されるため、型定義もstringにする
 */
export type AnimalImage = Omit<PrismaAnimalImage, "createdAt"> & {
  createdAt: string;
};

/**
 * シリアライズされたAnimal型
 * JSONレスポンスではDateTimeがstring型に変換されるため、型定義もstringにする
 */
export type Animal = Omit<PrismaAnimal, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  animalImages?: AnimalImage[];
};

export { createAdminAnimalsRoutes } from "./animals.admin.routes";
export type {
  AnimalFilter,
  AnimalImageFilter,
  AnimalsRepository,
  CreateAnimalImageInput,
  CreateAnimalInput,
  UpdateAnimalImageInput,
  UpdateAnimalInput,
} from "./animals.repository";
export { createAnimalsRepository } from "./animals.repository";
export { animalsRoutes } from "./animals.routes";
export type {
  AnimalImagesListResponse,
  AnimalsListResponse,
  AnimalsService,
} from "./animals.service";
export { createAnimalsService } from "./animals.service";
