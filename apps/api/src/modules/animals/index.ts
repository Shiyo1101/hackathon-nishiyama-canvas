/**
 * 動物モジュール
 * @module animals
 */

import type { Animal as PrismaAnimal, AnimalImage as PrismaAnimalImage } from "@prisma/client";

/**
 * シリアライズされたAnimal型
 * JSONレスポンスではDateTimeがstring型に変換されるため、型定義もstringにする
 */
export type Animal = Omit<PrismaAnimal, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

/**
 * シリアライズされたAnimalImage型
 * JSONレスポンスではDateTimeがstring型に変換されるため、型定義もstringにする
 */
export type AnimalImage = Omit<PrismaAnimalImage, "createdAt"> & {
  createdAt: string;
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
