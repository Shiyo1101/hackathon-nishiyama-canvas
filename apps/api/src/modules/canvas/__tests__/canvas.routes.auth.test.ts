/**
 * キャンバスAPI 認証統合テスト
 */

import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { prisma } from "../../../lib/db";
import { createCanvasHandlers } from "../canvas.handlers";
import { createCanvasRepository } from "../canvas.repository";
import { createCanvasRoutes } from "../canvas.routes";
import { createCanvasService } from "../canvas.service";

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

describe("キャンバスAPI 認証統合テスト", () => {
  let testUserId: string;
  let testUserEmail: string;
  let canvasRoutes: ReturnType<typeof createCanvasRoutes>;

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

    // キャンバスルートのセットアップ
    const repository = createCanvasRepository(prisma);
    const service = createCanvasService(repository);
    const handlers = createCanvasHandlers(service, repository);
    canvasRoutes = createCanvasRoutes(handlers);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /me - 自分のキャンバス取得", () => {
    test("認証済みユーザーの場合、キャンバスを取得できる", async () => {
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

      // キャンバスを作成
      await prisma.canvas.create({
        data: {
          userId: testUserId,
          title: "Auth Test Canvas",
          slug: generateUniqueSlug("auth-test"),
          layoutConfig: {
            template_id: "template-01",
            background: { type: "color", color: "#ffffff" },
            items: [],
          },
        },
      });

      // Act
      const res = await canvasRoutes.request("/me");

      // Assert
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        success: boolean;
        data: { canvas: { title: string } };
      };
      expect(data.success).toBe(true);
      expect(data.data.canvas.title).toBe("Auth Test Canvas");
    });

    test("未認証ユーザーの場合、401エラーを返す", async () => {
      // Arrange
      vi.mocked(mockAuth.api.getSession).mockResolvedValue(null);

      // Act
      const res = await canvasRoutes.request("/me");

      // Assert
      expect(res.status).toBe(401);
    });
  });

  describe("POST / - キャンバス作成", () => {
    test("認証済みユーザーの場合、キャンバスを作成できる", async () => {
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

      // 既存のキャンバスを削除
      await prisma.canvas.deleteMany({ where: { userId: testUserId } });

      const requestBody = {
        title: "New Auth Test Canvas",
        description: "Test description",
        slug: generateUniqueSlug("new-auth-test"),
        layoutConfig: {
          template_id: "template-01",
          background: { type: "color", color: "#ffffff" },
          items: [],
        },
      };

      // Act
      const res = await canvasRoutes.request("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Assert
      expect(res.status).toBe(201);
      const data = (await res.json()) as { success: boolean; data: { canvas: { title: string } } };
      expect(data.success).toBe(true);
      expect(data.data.canvas.title).toBe("New Auth Test Canvas");
    });

    test("未認証ユーザーの場合、401エラーを返す", async () => {
      // Arrange
      vi.mocked(mockAuth.api.getSession).mockResolvedValue(null);

      const requestBody = {
        title: "Unauthorized Canvas",
        slug: generateUniqueSlug("unauthorized"),
        layoutConfig: {
          template_id: "template-01",
          background: { type: "color" },
          items: [],
        },
      };

      // Act
      const res = await canvasRoutes.request("/", {
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

  describe("PUT /:id - キャンバス更新", () => {
    test("認証済みユーザーは自分のキャンバスを更新できる", async () => {
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

      // 既存のキャンバスを削除
      await prisma.canvas.deleteMany({ where: { userId: testUserId } });

      // キャンバスを作成
      const canvas = await prisma.canvas.create({
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
      const res = await canvasRoutes.request(`/${canvas.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateBody),
      });

      // Assert
      expect(res.status).toBe(200);
      const data = (await res.json()) as { success: boolean; data: { canvas: { title: string } } };
      expect(data.success).toBe(true);
      expect(data.data.canvas.title).toBe("Updated Title");
    });

    test("未認証ユーザーの場合、401エラーを返す", async () => {
      // Arrange
      vi.mocked(mockAuth.api.getSession).mockResolvedValue(null);

      const updateBody = {
        title: "Unauthorized Update",
      };

      // Act
      const res = await canvasRoutes.request("/canvas-id-123", {
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

  describe("DELETE /:id - キャンバス削除", () => {
    test("認証済みユーザーは自分のキャンバスを削除できる", async () => {
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

      // 既存のキャンバスを削除
      await prisma.canvas.deleteMany({ where: { userId: testUserId } });

      // キャンバスを作成
      const canvas = await prisma.canvas.create({
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
      const res = await canvasRoutes.request(`/${canvas.id}`, {
        method: "DELETE",
      });

      // Assert
      expect(res.status).toBe(200);
      const data = (await res.json()) as { success: boolean; data: { canvas: { title: string } } };
      expect(data.success).toBe(true);

      // キャンバスが削除されていることを確認
      const deletedCanvas = await prisma.canvas.findUnique({
        where: { id: canvas.id },
      });
      expect(deletedCanvas).toBeNull();
    });

    test("未認証ユーザーの場合、401エラーを返す", async () => {
      // Arrange
      vi.mocked(mockAuth.api.getSession).mockResolvedValue(null);

      // Act
      const res = await canvasRoutes.request("/canvas-id-123", {
        method: "DELETE",
      });

      // Assert
      expect(res.status).toBe(401);
    });
  });
});
