import type { User } from "../../lib/db";
import type { UpdateUserInput, UserFilter, UserRepository } from "./user.repository";

/**
 * ユーザー一覧のレスポンス型
 */
export type UsersListResponse = {
  users: User[];
  total: number;
  limit: number;
  offset: number;
};

/**
 * UserServiceの型定義
 */
export type UserService = {
  /**
   * ユーザー一覧を取得（管理者のみ）
   */
  getUsersList: (filter?: UserFilter) => Promise<UsersListResponse>;

  /**
   * ユーザー詳細を取得（管理者のみ）
   */
  getUserById: (id: string) => Promise<User | null>;

  /**
   * ユーザーを更新（管理者のみ）
   */
  updateUser: (id: string, input: UpdateUserInput) => Promise<User>;

  /**
   * ユーザーを削除（管理者のみ）
   */
  deleteUser: (id: string) => Promise<void>;
};

/**
 * UserServiceを作成
 */
export const createUserService = (userRepository: UserRepository): UserService => ({
  getUsersList: async (filter?: UserFilter): Promise<UsersListResponse> => {
    const { limit = 20, offset = 0 } = filter ?? {};

    const [users, total] = await Promise.all([
      userRepository.findMany(filter),
      userRepository.count(filter),
    ]);

    return {
      users,
      total,
      limit,
      offset,
    };
  },

  getUserById: async (id: string): Promise<User | null> => {
    return userRepository.findById(id);
  },

  updateUser: async (id: string, input: UpdateUserInput): Promise<User> => {
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new Error("ユーザーが見つかりません");
    }

    return userRepository.update(id, input);
  },

  deleteUser: async (id: string): Promise<void> => {
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new Error("ユーザーが見つかりません");
    }

    await userRepository.delete(id);
  },
});
