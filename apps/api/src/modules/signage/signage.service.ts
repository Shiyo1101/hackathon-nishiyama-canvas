import type { Signage } from "../../lib/db";
import type { SignageRepository } from "./signage.repository";
import type { CreateSignageInput, UpdateSignageInput } from "./signage.routes";

export type SignageService = {
  getUserSignage: (userId: string) => Promise<Signage | null>;
  createSignage: (userId: string, input: CreateSignageInput) => Promise<Signage>;
  updateSignage: (userId: string, signageId: string, input: UpdateSignageInput) => Promise<Signage>;
  updatePublishStatus: (userId: string, signageId: string, isPublic: boolean) => Promise<Signage>;
  deleteSignage: (userId: string, signageId: string) => Promise<void>;
  getPublicSignage: (slug: string) => Promise<Signage>;
  getPopularSignages: (limit: number) => Promise<Signage[]>;
  getFavoriteSignages: (userId: string, limit?: number) => Promise<Signage[]>;
  addFavorite: (userId: string, signageId: string) => Promise<{ id: string }>;
  removeFavorite: (userId: string, signageId: string) => Promise<void>;
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
    // Phase 1: 無料プランでは1ユーザー1サイネージ制限
    // TODO: Phase 2で有料プラン実装時は UserPlan テーブルを参照してlimitを動的に取得
    const MAX_SIGNAGES_FREE_PLAN = 1;
    const signageCount = await repository.countByUserId(userId);

    if (signageCount >= MAX_SIGNAGES_FREE_PLAN) {
      throw new Error("無料プランでは1つまでサイネージを作成できます");
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

  getPopularSignages: async (limit: number): Promise<Signage[]> => {
    return repository.findPopularPublicSignages(limit);
  },

  getFavoriteSignages: async (userId: string, limit?: number): Promise<Signage[]> => {
    return repository.findFavoritesByUserId(userId, limit);
  },

  addFavorite: async (userId: string, signageId: string): Promise<{ id: string }> => {
    const signage = await repository.findById(signageId);
    if (!signage) {
      throw new Error("サイネージが見つかりません");
    }

    if (!signage.isPublic) {
      throw new Error("非公開のサイネージはお気に入りに追加できません");
    }

    const alreadyFavorited = await repository.isFavorited(userId, signageId);
    if (alreadyFavorited) {
      throw new Error("すでにお気に入りに追加されています");
    }

    return repository.addFavorite(userId, signageId);
  },

  removeFavorite: async (userId: string, signageId: string): Promise<void> => {
    const isFavorited = await repository.isFavorited(userId, signageId);
    if (!isFavorited) {
      throw new Error("お気に入りに登録されていません");
    }

    return repository.removeFavorite(userId, signageId);
  },
});
