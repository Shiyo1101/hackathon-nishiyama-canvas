import type { PrismaClient, User, UserRole } from "../../lib/db";

/**
 * ユーザー一覧取得のフィルター
 */
export type UserFilter = {
  role?: UserRole;
  banned?: boolean;
  limit?: number;
  offset?: number;
};

/**
 * ユーザー更新入力
 */
export type UpdateUserInput = {
  name?: string;
  role?: UserRole;
  banned?: boolean;
  banReason?: string | null;
  banExpires?: Date | null;
};

/**
 * UserRepositoryの型定義
 */
export type UserRepository = {
  /**
   * ユーザー一覧を取得
   */
  findMany: (filter?: UserFilter) => Promise<User[]>;

  /**
   * IDでユーザーを取得
   */
  findById: (id: string) => Promise<User | null>;

  /**
   * ユーザーの総数を取得
   */
  count: (filter?: UserFilter) => Promise<number>;

  /**
   * ユーザーを更新（管理者のみ）
   */
  update: (id: string, input: UpdateUserInput) => Promise<User>;

  /**
   * ユーザーを削除（管理者のみ）
   */
  delete: (id: string) => Promise<void>;
};

/**
 * UserRepositoryを作成
 */
export const createUserRepository = (prisma: PrismaClient): UserRepository => ({
  findMany: async (filter?: UserFilter): Promise<User[]> => {
    const { role, banned, limit = 20, offset = 0 } = filter ?? {};

    return prisma.user.findMany({
      where: {
        ...(role !== undefined && { role }),
        ...(banned !== undefined && { banned }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  },

  findById: async (id: string): Promise<User | null> => {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  count: async (filter?: UserFilter): Promise<number> => {
    const { role, banned } = filter ?? {};

    return prisma.user.count({
      where: {
        ...(role !== undefined && { role }),
        ...(banned !== undefined && { banned }),
      },
    });
  },

  update: async (id: string, input: UpdateUserInput): Promise<User> => {
    return prisma.user.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.role !== undefined && { role: input.role }),
        ...(input.banned !== undefined && { banned: input.banned }),
        ...(input.banReason !== undefined && { banReason: input.banReason }),
        ...(input.banExpires !== undefined && { banExpires: input.banExpires }),
      },
    });
  },

  delete: async (id: string): Promise<void> => {
    await prisma.user.delete({
      where: { id },
    });
  },
});
