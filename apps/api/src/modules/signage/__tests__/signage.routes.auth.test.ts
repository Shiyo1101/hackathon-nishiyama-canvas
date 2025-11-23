/**
 * サイネージAPI 認証統合テスト
 */

import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { prisma } from "../../../lib/db";
import { createSignageHandlers } from "../signage.handlers";
import { createSignageRepository } from "../signage.repository";
import { createSignageRoutes } from "../signage.routes";
import { createSignageService } from "../signage.service";

// ユニークなslugを生成するヘルパー関数
const generateUniqueSlug = (prefix: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const processId = process.pid;
  return `${prefix}-${timestamp}-${random}-${processId}`;
};

// Better Authのモック（vi.hoisted()でホイスティング）
const mockAuth = vi.hoisted(() => ({
  api: {
    // biome-ignore lint/suspicious/noExplicitAny: テスト用モック
    getSession: vi.fn(async (): Promise<any> => null),
  },
}));

// auth.instanceをモック
vi.mock("../../auth/auth.instance", () => ({
  auth: mockAuth,
}));

describe("サイネージAPI 認証統合テスト", () => {
  let testUserId: string;
  let testUserEmail: string;
  let signageRoutes: ReturnType<typeof createSignageRoutes>;

  beforeAll(async () => {
    // テスト用ユーザー作成
    testUserEmail = `test-auth-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
    const user = await prisma.user.create({
      data: {
        email: testUserEmail,
        name: "Auth Test User",
        role: "user",
        emailVerified: true,
      },
    });
    testUserId = user.id;

    // サイネージルートのセットアップ
    const repository = createSignageRepository(prisma);
    const service = createSignageService(repository);
    const handlers = createSignageHandlers(service, repository);
    signageRoutes = createSignageRoutes(handlers);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /me - 自分のサイネージ取得", () => {
    test("認証済みユーザーの場合、サイネージを取得できる", async () => {
      // Arrange
      const mockSession = {
        user: {
          id: testUserId,
          email: testUserEmail,
          name: "Auth Test User",
          role: "user",
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: "session-123",
          userId: testUserId,
          expiresAt: new Date(Date.now() + 86400000),
          token: "token-123",
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      vi.mocked(mockAuth.api.getSession).mockResolvedValue(mockSession);

      // サイネージを作成
      await prisma.signage.create({
        data: {
          userId: testUserId,
          title: "Auth Test Signage",
          slug: generateUniqueSlug("auth-test"),
          layoutConfig: {
            template_id: "template-01",
            background: { type: "color", color: "#ffffff" },
            items: [],
          },
        },
      });

      // Act
      const res = await signageRoutes.request("/me");

      // Assert
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        success: boolean;
        data: { signage: { title: string } };
      };
      expect(data.success).toBe(true);
      expect(data.data.signage.title).toBe("Auth Test Signage");
    });

    test("未認証ユーザーの場合、401エラーを返す", async () => {
      // Arrange
      vi.mocked(mockAuth.api.getSession).mockResolvedValue(null);

      // Act
      const res = await signageRoutes.request("/me");

      // Assert
      expect(res.status).toBe(401);
    });
  });

  describe("POST / - サイネージ作成", () => {
    test("認証済みユーザーの場合、サイネージを作成できる", async () => {
      // Arrange
      const mockSession = {
        user: {
          id: testUserId,
          email: testUserEmail,
          name: "Auth Test User",
          role: "user",
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: "session-123",
          userId: testUserId,
          expiresAt: new Date(Date.now() + 86400000),
          token: "token-123",
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      vi.mocked(mockAuth.api.getSession).mockResolvedValue(mockSession);

      // 既存のサイネージを削除
      await prisma.signage.deleteMany({ where: { userId: testUserId } });

      const requestBody = {
        title: "New Auth Test Signage",
        description: "Test description",
        slug: generateUniqueSlug("new-auth-test"),
        layoutConfig: {
          template_id: "template-01",
          background: { type: "color", color: "#ffffff" },
          items: [],
        },
      };

      // Act
      const res = await signageRoutes.request("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Assert
      expect(res.status).toBe(201);
      const data = (await res.json()) as { success: boolean; data: { signage: { title: string } } };
      expect(data.success).toBe(true);
      expect(data.data.signage.title).toBe("New Auth Test Signage");
    });

    test("未認証ユーザーの場合、401エラーを返す", async () => {
      // Arrange
      vi.mocked(mockAuth.api.getSession).mockResolvedValue(null);

      const requestBody = {
        title: "Unauthorized Signage",
        slug: generateUniqueSlug("unauthorized"),
        layoutConfig: {
          template_id: "template-01",
          background: { type: "color" },
          items: [],
        },
      };

      // Act
      const res = await signageRoutes.request("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Assert
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /:id - サイネージ更新", () => {
    test("認証済みユーザーは自分のサイネージを更新できる", async () => {
      // Arrange
      const mockSession = {
        user: {
          id: testUserId,
          email: testUserEmail,
          name: "Auth Test User",
          role: "user",
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: "session-123",
          userId: testUserId,
          expiresAt: new Date(Date.now() + 86400000),
          token: "token-123",
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      vi.mocked(mockAuth.api.getSession).mockResolvedValue(mockSession);

      // 既存のサイネージを削除
      await prisma.signage.deleteMany({ where: { userId: testUserId } });

      // サイネージを作成
      const signage = await prisma.signage.create({
        data: {
          userId: testUserId,
          title: "Original Title",
          slug: generateUniqueSlug("update-test"),
          layoutConfig: {
            template_id: "template-01",
            background: { type: "color" },
            items: [],
          },
        },
      });

      const updateBody = {
        title: "Updated Title",
        layoutConfig: {
          template_id: "template-02",
          background: { type: "image", url: "https://example.com/bg.jpg" },
          items: [],
        },
      };

      // Act
      const res = await signageRoutes.request(`/${signage.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateBody),
      });

      // Assert
      expect(res.status).toBe(200);
      const data = (await res.json()) as { success: boolean; data: { signage: { title: string } } };
      expect(data.success).toBe(true);
      expect(data.data.signage.title).toBe("Updated Title");
    });

    test("未認証ユーザーの場合、401エラーを返す", async () => {
      // Arrange
      vi.mocked(mockAuth.api.getSession).mockResolvedValue(null);

      const updateBody = {
        title: "Unauthorized Update",
      };

      // Act
      const res = await signageRoutes.request("/signage-id-123", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateBody),
      });

      // Assert
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /:id - サイネージ削除", () => {
    test("認証済みユーザーは自分のサイネージを削除できる", async () => {
      // Arrange
      const mockSession = {
        user: {
          id: testUserId,
          email: testUserEmail,
          name: "Auth Test User",
          role: "user",
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: "session-123",
          userId: testUserId,
          expiresAt: new Date(Date.now() + 86400000),
          token: "token-123",
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      vi.mocked(mockAuth.api.getSession).mockResolvedValue(mockSession);

      // 既存のサイネージを削除
      await prisma.signage.deleteMany({ where: { userId: testUserId } });

      // サイネージを作成
      const signage = await prisma.signage.create({
        data: {
          userId: testUserId,
          title: "To Be Deleted",
          slug: generateUniqueSlug("delete-test"),
          layoutConfig: {
            template_id: "template-01",
            background: { type: "color" },
            items: [],
          },
        },
      });

      // Act
      const res = await signageRoutes.request(`/${signage.id}`, {
        method: "DELETE",
      });

      // Assert
      expect(res.status).toBe(200);
      const data = (await res.json()) as { success: boolean; data: { signage: { title: string } } };
      expect(data.success).toBe(true);

      // サイネージが削除されていることを確認
      const deletedSignage = await prisma.signage.findUnique({
        where: { id: signage.id },
      });
      expect(deletedSignage).toBeNull();
    });

    test("未認証ユーザーの場合、401エラーを返す", async () => {
      // Arrange
      vi.mocked(mockAuth.api.getSession).mockResolvedValue(null);

      // Act
      const res = await signageRoutes.request("/signage-id-123", {
        method: "DELETE",
      });

      // Assert
      expect(res.status).toBe(401);
    });
  });
});
