/**
 * 認証ミドルウェア ユニットテスト
 */

import { Hono } from "hono";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { authMiddleware, requireAdmin, requireAuth } from "../auth.middleware";
import type { AuthenticatedVariables, AuthVariables } from "../auth.types";

// Better Authのモック（vi.hoisted()でホイスティング）
const mockAuth = vi.hoisted(() => ({
  api: {
    // biome-ignore lint/suspicious/noExplicitAny: テスト用モック
    getSession: vi.fn(async (): Promise<any> => null),
  },
}));

// auth.instanceをモック
vi.mock("../auth.instance", () => ({
  auth: mockAuth,
}));

describe("認証ミドルウェア", () => {
  describe("authMiddleware", () => {
    let app: Hono<{ Variables: AuthVariables }>;

    beforeEach(() => {
      app = new Hono<{ Variables: AuthVariables }>();
      app.use("*", authMiddleware);
      app.get("/test", (c) => {
        const user = c.get("user");
        const session = c.get("session");
        return c.json({ user, session });
      });
      vi.clearAllMocks();
    });

    test("セッションが存在する場合、userとsessionを設定する", async () => {
      // Arrange
      const mockSession = {
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
          role: "user",
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: "session-123",
          userId: "user-123",
          expiresAt: new Date(Date.now() + 86400000),
          token: "token-123",
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      vi.mocked(mockAuth.api.getSession).mockResolvedValueOnce(mockSession);

      // Act
      const res = await app.request("/test");
      const data = (await res.json()) as { user: unknown; session: unknown };

      // Assert
      expect(res.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.session).toBeDefined();
    });

    test("セッションが存在しない場合、userとsessionをnullに設定する", async () => {
      // Arrange
      vi.mocked(mockAuth.api.getSession).mockResolvedValueOnce(null);

      // Act
      const res = await app.request("/test");
      const data = (await res.json()) as { user: unknown; session: unknown };

      // Assert
      expect(res.status).toBe(200);
      expect(data.user).toBeNull();
      expect(data.session).toBeNull();
    });

    test("エラーが発生した場合、userとsessionをnullに設定する", async () => {
      // Arrange
      vi.mocked(mockAuth.api.getSession).mockRejectedValueOnce(new Error("Session error"));

      // Act
      const res = await app.request("/test");
      const data = (await res.json()) as { user: unknown; session: unknown };

      // Assert
      expect(res.status).toBe(200);
      expect(data.user).toBeNull();
      expect(data.session).toBeNull();
    });
  });

  describe("requireAuth", () => {
    let app: Hono<{ Variables: AuthenticatedVariables }>;

    beforeEach(() => {
      app = new Hono<{ Variables: AuthenticatedVariables }>();
      app.use("*", authMiddleware);
      app.use("*", requireAuth);
      app.get("/protected", (c) => {
        const user = c.get("user");
        return c.json({ userId: user.id });
      });
      vi.clearAllMocks();
    });

    test("認証済みユーザーの場合、リクエストを通す", async () => {
      // Arrange
      const mockSession = {
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
          role: "user",
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: "session-123",
          userId: "user-123",
          expiresAt: new Date(Date.now() + 86400000),
          token: "token-123",
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      vi.mocked(mockAuth.api.getSession).mockResolvedValueOnce(mockSession);

      // Act
      const res = await app.request("/protected");
      const data = (await res.json()) as { userId: string };

      // Assert
      expect(res.status).toBe(200);
      expect(data.userId).toBe("user-123");
    });

    test("未認証ユーザーの場合、401エラーを返す", async () => {
      // Arrange
      vi.mocked(mockAuth.api.getSession).mockResolvedValueOnce(null);

      // Act
      const res = await app.request("/protected");

      // Assert
      expect(res.status).toBe(401);
    });
  });

  describe("requireAdmin", () => {
    let app: Hono<{ Variables: AuthenticatedVariables }>;

    beforeEach(() => {
      app = new Hono<{ Variables: AuthenticatedVariables }>();
      app.use("*", authMiddleware);
      app.use("*", requireAdmin);
      app.get("/admin", (c) => {
        const user = c.get("user");
        return c.json({ userId: user.id, role: user.role });
      });
      vi.clearAllMocks();
    });

    test("管理者ユーザーの場合、リクエストを通す", async () => {
      // Arrange
      const mockSession = {
        user: {
          id: "admin-123",
          email: "admin@example.com",
          name: "Admin User",
          role: "admin",
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: "session-123",
          userId: "admin-123",
          expiresAt: new Date(Date.now() + 86400000),
          token: "token-123",
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      vi.mocked(mockAuth.api.getSession).mockResolvedValueOnce(mockSession);

      // Act
      const res = await app.request("/admin");
      const data = (await res.json()) as { userId: string; role: string };

      // Assert
      expect(res.status).toBe(200);
      expect(data.role).toBe("admin");
    });

    test("一般ユーザーの場合、403エラーを返す", async () => {
      // Arrange
      const mockSession = {
        user: {
          id: "user-123",
          email: "user@example.com",
          name: "Regular User",
          role: "user",
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: "session-123",
          userId: "user-123",
          expiresAt: new Date(Date.now() + 86400000),
          token: "token-123",
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      vi.mocked(mockAuth.api.getSession).mockResolvedValueOnce(mockSession);

      // Act
      const res = await app.request("/admin");

      // Assert
      expect(res.status).toBe(403);
    });

    test("未認証ユーザーの場合、401エラーを返す", async () => {
      // Arrange
      vi.mocked(mockAuth.api.getSession).mockResolvedValueOnce(null);

      // Act
      const res = await app.request("/admin");

      // Assert
      expect(res.status).toBe(401);
    });
  });
});
