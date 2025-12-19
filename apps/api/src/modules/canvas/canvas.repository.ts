import type { Canvas, Prisma, PrismaClient } from "../../lib/db";
import type { CreateCanvasInput, UpdateCanvasInput } from "./canvas.routes";

export type CanvasRepository = {
  findByUserId: (userId: string) => Promise<Canvas | null>;
  findBySlug: (slug: string) => Promise<Canvas | null>;
  findById: (id: string) => Promise<Canvas | null>;
  findPopularPublicCanvases: (limit: number) => Promise<Canvas[]>;
  countByUserId: (userId: string) => Promise<number>;
  create: (userId: string, input: CreateCanvasInput) => Promise<Canvas>;
  update: (id: string, input: UpdateCanvasInput) => Promise<Canvas>;
  updatePublishStatus: (id: string, isPublic: boolean) => Promise<Canvas>;
  delete: (id: string) => Promise<void>;
  incrementViewCount: (id: string) => Promise<void>;
  findFavoritesByUserId: (userId: string, limit?: number) => Promise<Canvas[]>;
  addFavorite: (userId: string, canvasId: string) => Promise<{ id: string }>;
  removeFavorite: (userId: string, canvasId: string) => Promise<void>;
  isFavorited: (userId: string, canvasId: string) => Promise<boolean>;
};

export const createCanvasRepository = (prisma: PrismaClient): CanvasRepository => ({
  findByUserId: async (userId: string): Promise<Canvas | null> => {
    return prisma.canvas.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  findBySlug: async (slug: string): Promise<Canvas | null> => {
    return prisma.canvas.findUnique({
      where: { slug },
    });
  },

  findById: async (id: string): Promise<Canvas | null> => {
    return prisma.canvas.findUnique({
      where: { id },
    });
  },

  findPopularPublicCanvases: async (limit: number): Promise<Canvas[]> => {
    return prisma.canvas.findMany({
      where: { isPublic: true },
      orderBy: { likeCount: "desc" },
      take: limit,
    });
  },

  countByUserId: async (userId: string): Promise<number> => {
    return prisma.canvas.count({
      where: { userId },
    });
  },

  create: async (userId: string, input: CreateCanvasInput): Promise<Canvas> => {
    return prisma.canvas.create({
      data: {
        userId,
        title: input.title,
        description: input.description,
        slug: input.slug,
        layoutConfig: input.layoutConfig as Prisma.InputJsonValue,
        isPublic: false,
        viewCount: 0,
      },
    });
  },

  update: async (id: string, input: UpdateCanvasInput): Promise<Canvas> => {
    return prisma.canvas.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.layoutConfig !== undefined && {
          layoutConfig: input.layoutConfig as Prisma.InputJsonValue,
        }),
        ...(input.thumbnailUrl !== undefined && {
          thumbnailUrl: input.thumbnailUrl,
        }),
        ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
      },
    });
  },

  updatePublishStatus: async (id: string, isPublic: boolean): Promise<Canvas> => {
    return prisma.canvas.update({
      where: { id },
      data: { isPublic },
    });
  },

  delete: async (id: string): Promise<void> => {
    await prisma.canvas.delete({
      where: { id },
    });
  },

  incrementViewCount: async (id: string): Promise<void> => {
    await prisma.canvas.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  },

  findFavoritesByUserId: async (userId: string, limit = 10): Promise<Canvas[]> => {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        canvas: true,
      },
    });
    return favorites.map((favorite) => favorite.canvas);
  },

  addFavorite: async (userId: string, canvasId: string): Promise<{ id: string }> => {
    // トランザクションを使用してアトミックな操作を保証
    return prisma.$transaction(async (tx) => {
      const favorite = await tx.favorite.create({
        data: {
          userId,
          canvasId,
        },
      });

      // お気に入り数をインクリメント
      await tx.canvas.update({
        where: { id: canvasId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });

      return { id: favorite.id };
    });
  },

  removeFavorite: async (userId: string, canvasId: string): Promise<void> => {
    // トランザクションを使用してアトミックな操作を保証
    await prisma.$transaction(async (tx) => {
      await tx.favorite.delete({
        where: {
          userId_canvasId: {
            userId,
            canvasId,
          },
        },
      });

      // お気に入り数をデクリメント
      await tx.canvas.update({
        where: { id: canvasId },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
      });
    });
  },

  isFavorited: async (userId: string, canvasId: string): Promise<boolean> => {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_canvasId: {
          userId,
          canvasId,
        },
      },
    });
    return favorite !== null;
  },
});
