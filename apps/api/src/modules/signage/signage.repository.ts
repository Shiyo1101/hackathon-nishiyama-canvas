import type { Prisma, PrismaClient, Signage } from "../../lib/db";
import type { CreateSignageInput, UpdateSignageInput } from "../../types";

export type SignageRepository = {
  findByUserId: (userId: string) => Promise<Signage | null>;
  findBySlug: (slug: string) => Promise<Signage | null>;
  findById: (id: string) => Promise<Signage | null>;
  create: (userId: string, input: CreateSignageInput) => Promise<Signage>;
  update: (id: string, input: UpdateSignageInput) => Promise<Signage>;
  updatePublishStatus: (id: string, isPublic: boolean) => Promise<Signage>;
  delete: (id: string) => Promise<void>;
  incrementViewCount: (id: string) => Promise<void>;
};

export const createSignageRepository = (prisma: PrismaClient): SignageRepository => ({
  findByUserId: async (userId: string): Promise<Signage | null> => {
    return prisma.signage.findUnique({
      where: { userId },
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
});
