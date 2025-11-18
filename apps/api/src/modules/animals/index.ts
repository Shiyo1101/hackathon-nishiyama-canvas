/**
 * 動物モジュール
 * @module animals
 */

import type { Animal, AnimalImage } from "@prisma/client";

export type { Animal, AnimalImage };

export { createAnimalsRepository } from "./animals.repository";
export type {
  AnimalFilter,
  AnimalImageFilter,
  AnimalsRepository,
} from "./animals.repository";
export { createAnimalsRoutes } from "./animals.routes";
export { createAnimalsService } from "./animals.service";
export type {
  AnimalImagesListResponse,
  AnimalsListResponse,
  AnimalsService,
} from "./animals.service";
