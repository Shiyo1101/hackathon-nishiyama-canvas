import type { Prisma, PrismaClient, Signage } from "../../lib/db";
import type { CreateSignageInput, UpdateSignageInput } from "./signage.routes";

export type SignageRepository = {
  findByUserId: (userId: string) => Promise<Signage | null>;
  findBySlug: (slug: string) => Promise<Signage | null>;
  findById: (id: string) => Promise<Signage | null>;
  findPopularPublicSignages: (limit: number) => Promise<Signage[]>;
  countByUserId: (userId: string) => Promise<number>;
  create: (userId: string, input: CreateSignageInput) => Promise<Signage>;
  update: (id: string, input: UpdateSignageInput) => Promise<Signage>;
  updatePublishStatus: (id: string, isPublic: boolean) => Promise<Signage>;
  delete: (id: string) => Promise<void>;
  incrementViewCount: (id: string) => Promise<void>;
  findFavoritesByUserId: (userId: string, limit?: number) => Promise<Signage[]>;
  addFavorite: (userId: string, signageId: string) => Promise<{ id: string }>;
  removeFavorite: (userId: string, signageId: string) => Promise<void>;
  isFavorited: (userId: string, signageId: string) => Promise<boolean>;
};

export const createSignageRepository = (prisma: PrismaClient): SignageRepository => ({
  findByUserId: async (userId: string): Promise<Signage | null> => {
    return prisma.signage.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  findBySlug: async (slug: string): Promise<Signage | null> => {
    return prisma.signage.findUnique({
      where: { slug },
    });
  },

  findById: async (id: string): Promise<Signage | null> => {
    return prisma.signage.findUnique({
      where: { id },
    });
  },

  findPopularPublicSignages: async (limit: number): Promise<Signage[]> => {
    return prisma.signage.findMany({
      where: { isPublic: true },
      orderBy: { likeCount: "desc" },
      take: limit,
    });
  },

  countByUserId: async (userId: string): Promise<number> => {
    return prisma.signage.count({
      where: { userId },
    });
  },

  create: async (userId: string, input: CreateSignageInput): Promise<Signage> => {
    return prisma.signage.create({
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

  update: async (id: string, input: UpdateSignageInput): Promise<Signage> => {
    return prisma.signage.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.layoutConfig !== undefined && {
          layoutConfig: input.layoutConfig as Prisma.InputJsonValue,
        }),
      },
    });
  },

  updatePublishStatus: async (id: string, isPublic: boolean): Promise<Signage> => {
    return prisma.signage.update({
      where: { id },
      data: { isPublic },
    });
  },

  delete: async (id: string): Promise<void> => {
    await prisma.signage.delete({
      where: { id },
    });
  },

  incrementViewCount: async (id: string): Promise<void> => {
    await prisma.signage.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  },

  findFavoritesByUserId: async (userId: string, limit = 10): Promise<Signage[]> => {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        signage: true,
      },
    });
    return favorites.map((favorite) => favorite.signage);
  },

  addFavorite: async (userId: string, signageId: string): Promise<{ id: string }> => {
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        signageId,
      },
    });

    // お気に入り数をインクリメント
    await prisma.signage.update({
      where: { id: signageId },
      data: {
        likeCount: {
          increment: 1,
        },
      },
    });

    return { id: favorite.id };
  },

  removeFavorite: async (userId: string, signageId: string): Promise<void> => {
    await prisma.favorite.delete({
      where: {
        userId_signageId: {
          userId,
          signageId,
        },
      },
    });

    // お気に入り数をデクリメント
    await prisma.signage.update({
      where: { id: signageId },
      data: {
        likeCount: {
          decrement: 1,
        },
      },
    });
  },

  isFavorited: async (userId: string, signageId: string): Promise<boolean> => {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_signageId: {
          userId,
          signageId,
        },
      },
    });
    return favorite !== null;
  },
});
