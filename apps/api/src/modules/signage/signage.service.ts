import type { Signage } from "../../lib/db";
import type { CreateSignageInput, UpdateSignageInput } from "../../types";
import type { SignageRepository } from "./signage.repository";

export type SignageService = {
  getUserSignage: (userId: string) => Promise<Signage | null>;
  createSignage: (userId: string, input: CreateSignageInput) => Promise<Signage>;
  updateSignage: (userId: string, signageId: string, input: UpdateSignageInput) => Promise<Signage>;
  updatePublishStatus: (userId: string, signageId: string, isPublic: boolean) => Promise<Signage>;
  deleteSignage: (userId: string, signageId: string) => Promise<void>;
  getPublicSignage: (slug: string) => Promise<Signage>;
};

const checkOwnership = async (repository: SignageRepository, userId: string, signageId: string) => {
  const signage = await repository.findById(signageId);

  if (!signage) {
    throw new Error("サイネージが見つかりません");
  }

  if (signage.userId !== userId) {
    throw new Error("このサイネージを操作する権限がありません");
  }

  return signage;
};

export const createSignageService = (repository: SignageRepository): SignageService => ({
  getUserSignage: async (userId: string): Promise<Signage | null> => {
    return repository.findByUserId(userId);
  },

  createSignage: async (userId: string, input: CreateSignageInput): Promise<Signage> => {
    const existingSignage = await repository.findByUserId(userId);
    if (existingSignage) {
      throw new Error("すでにサイネージが存在します");
    }

    const existingSlug = await repository.findBySlug(input.slug);
    if (existingSlug) {
      throw new Error("このスラッグは既に使用されています");
    }

    return repository.create(userId, input);
  },

  updateSignage: async (
    userId: string,
    signageId: string,
    input: UpdateSignageInput,
  ): Promise<Signage> => {
    await checkOwnership(repository, userId, signageId);
    return repository.update(signageId, input);
  },

  updatePublishStatus: async (
    userId: string,
    signageId: string,
    isPublic: boolean,
  ): Promise<Signage> => {
    await checkOwnership(repository, userId, signageId);
    return repository.updatePublishStatus(signageId, isPublic);
  },

  deleteSignage: async (userId: string, signageId: string): Promise<void> => {
    await checkOwnership(repository, userId, signageId);
    await repository.delete(signageId);
  },

  getPublicSignage: async (slug: string): Promise<Signage> => {
    const signage = await repository.findBySlug(slug);

    if (!signage || !signage.isPublic) {
      throw new Error("サイネージが見つかりません");
    }

    await repository.incrementViewCount(signage.id);
    return signage;
  },
});
