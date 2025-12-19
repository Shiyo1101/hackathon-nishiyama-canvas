import { PLAN_LIMITS } from "../../config/constants";
import type { Canvas } from "../../lib/db";
import { ConflictError, ForbiddenError, NotFoundError } from "../../lib/errors";
import type { CanvasRepository } from "./canvas.repository";
import type { CreateCanvasInput, UpdateCanvasInput } from "./canvas.routes";

export type CanvasService = {
  getUserCanvas: (userId: string) => Promise<Canvas | null>;
  createCanvas: (userId: string, input: CreateCanvasInput) => Promise<Canvas>;
  updateCanvas: (userId: string, canvasId: string, input: UpdateCanvasInput) => Promise<Canvas>;
  updatePublishStatus: (userId: string, canvasId: string, isPublic: boolean) => Promise<Canvas>;
  deleteCanvas: (userId: string, canvasId: string) => Promise<void>;
  getPublicCanvas: (slug: string) => Promise<Canvas>;
  getPopularCanvases: (limit: number) => Promise<Canvas[]>;
  getFavoriteCanvases: (userId: string, limit?: number) => Promise<Canvas[]>;
  addFavorite: (userId: string, canvasId: string) => Promise<{ id: string }>;
  removeFavorite: (userId: string, canvasId: string) => Promise<void>;
};

const checkOwnership = async (repository: CanvasRepository, userId: string, canvasId: string) => {
  const canvas = await repository.findById(canvasId);

  if (!canvas) {
    throw new NotFoundError("キャンバスが見つかりません");
  }

  if (canvas.userId !== userId) {
    throw new ForbiddenError("このキャンバスを操作する権限がありません");
  }

  return canvas;
};

export const createCanvasService = (repository: CanvasRepository): CanvasService => ({
  getUserCanvas: async (userId: string): Promise<Canvas | null> => {
    return repository.findByUserId(userId);
  },

  createCanvas: async (userId: string, input: CreateCanvasInput): Promise<Canvas> => {
    // Phase 1: 無料プランでは1ユーザー1キャンバス制限
    // TODO: Phase 2で有料プラン実装時は UserPlan テーブルを参照してlimitを動的に取得
    const canvasCount = await repository.countByUserId(userId);

    if (canvasCount >= PLAN_LIMITS.FREE.MAX_CANVASES) {
      throw new ConflictError("無料プランでは1つまでキャンバスを作成できます");
    }

    const existingSlug = await repository.findBySlug(input.slug);
    if (existingSlug) {
      throw new ConflictError("このスラッグは既に使用されています");
    }

    return repository.create(userId, input);
  },

  updateCanvas: async (
    userId: string,
    canvasId: string,
    input: UpdateCanvasInput,
  ): Promise<Canvas> => {
    await checkOwnership(repository, userId, canvasId);
    return repository.update(canvasId, input);
  },

  updatePublishStatus: async (
    userId: string,
    canvasId: string,
    isPublic: boolean,
  ): Promise<Canvas> => {
    await checkOwnership(repository, userId, canvasId);
    return repository.updatePublishStatus(canvasId, isPublic);
  },

  deleteCanvas: async (userId: string, canvasId: string): Promise<void> => {
    await checkOwnership(repository, userId, canvasId);
    await repository.delete(canvasId);
  },

  getPublicCanvas: async (slug: string): Promise<Canvas> => {
    const canvas = await repository.findBySlug(slug);

    if (!canvas || !canvas.isPublic) {
      throw new NotFoundError("キャンバスが見つかりません");
    }

    // 閲覧数のインクリメントはハンドラー層でバックグラウンド実行
    return canvas;
  },

  getPopularCanvases: async (limit: number): Promise<Canvas[]> => {
    return repository.findPopularPublicCanvases(limit);
  },

  getFavoriteCanvases: async (userId: string, limit?: number): Promise<Canvas[]> => {
    return repository.findFavoritesByUserId(userId, limit);
  },

  addFavorite: async (userId: string, canvasId: string): Promise<{ id: string }> => {
    const canvas = await repository.findById(canvasId);
    if (!canvas) {
      throw new NotFoundError("キャンバスが見つかりません");
    }

    if (!canvas.isPublic) {
      throw new ForbiddenError("非公開のキャンバスはお気に入りに追加できません");
    }

    const alreadyFavorited = await repository.isFavorited(userId, canvasId);
    if (alreadyFavorited) {
      throw new ConflictError("すでにお気に入りに追加されています");
    }

    return repository.addFavorite(userId, canvasId);
  },

  removeFavorite: async (userId: string, canvasId: string): Promise<void> => {
    const isFavorited = await repository.isFavorited(userId, canvasId);
    if (!isFavorited) {
      throw new NotFoundError("お気に入りに登録されていません");
    }

    return repository.removeFavorite(userId, canvasId);
  },
});
