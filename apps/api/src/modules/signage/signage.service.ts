import { PLAN_LIMITS } from "../../config/constants";
import type { Signage } from "../../lib/db";
import { ConflictError, ForbiddenError, NotFoundError } from "../../lib/errors";
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
    throw new NotFoundError("サイネージが見つかりません");
  }

  if (signage.userId !== userId) {
    throw new ForbiddenError("このサイネージを操作する権限がありません");
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
    const signageCount = await repository.countByUserId(userId);

    if (signageCount >= PLAN_LIMITS.FREE.MAX_SIGNAGES) {
      throw new ConflictError("無料プランでは1つまでサイネージを作成できます");
    }

    const existingSlug = await repository.findBySlug(input.slug);
    if (existingSlug) {
      throw new ConflictError("このスラッグは既に使用されています");
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
      throw new NotFoundError("サイネージが見つかりません");
    }

    // 閲覧数のインクリメントはハンドラー層でバックグラウンド実行
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
      throw new NotFoundError("サイネージが見つかりません");
    }

    if (!signage.isPublic) {
      throw new ForbiddenError("非公開のサイネージはお気に入りに追加できません");
    }

    const alreadyFavorited = await repository.isFavorited(userId, signageId);
    if (alreadyFavorited) {
      throw new ConflictError("すでにお気に入りに追加されています");
    }

    return repository.addFavorite(userId, signageId);
  },

  removeFavorite: async (userId: string, signageId: string): Promise<void> => {
    const isFavorited = await repository.isFavorited(userId, signageId);
    if (!isFavorited) {
      throw new NotFoundError("お気に入りに登録されていません");
    }

    return repository.removeFavorite(userId, signageId);
  },
});
