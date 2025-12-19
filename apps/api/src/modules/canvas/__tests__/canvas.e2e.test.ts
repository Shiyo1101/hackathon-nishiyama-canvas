/**
 * キャンバスE2Eテスト - サムネイル更新機能の統合テスト
 */

import { zValidator } from "@hono/zod-validator";
import type { Context, Next } from "hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { beforeEach, describe, expect, test } from "vitest";
import type { User } from "../../../lib/db";
import { prisma } from "../../../lib/db";
import type { AuthenticatedVariables } from "../../auth";
import { createCanvasHandlers } from "../canvas.handlers";
import { createCanvasRepository } from "../canvas.repository";
import { UpdateCanvasRequestSchema } from "../canvas.routes";
import { createCanvasService } from "../canvas.service";

describe("Canvas Thumbnail E2E Test", () => {
  let app: Hono;
  let testUser: User;
  let authCookie: string;
  let testCanvasId: string;

  // テスト用の認証ミドルウェア
  const testAuthMiddleware = async (c: Context, next: Next): Promise<void> => {
    const cookieHeader = c.req.header("Cookie");
    if (!cookieHeader?.includes("better-auth.session_token=")) {
      c.set("user", null);
      c.set("session", null);
      await next();
      return;
    }

    const token = cookieHeader.split("better-auth.session_token=")[1]?.split(";")[0];
    if (!token) {
      c.set("user", null);
      c.set("session", null);
      await next();
      return;
    }

    // セッショントークンからユーザーを取得
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (session?.user) {
      c.set("user", session.user);
      c.set("session", session);
    } else {
      c.set("user", null);
      c.set("session", null);
    }

    await next();
  };

  const testRequireAuth = async (c: Context, next: Next): Promise<void> => {
    const user = c.get("user");
    if (!user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    await next();
  };

  beforeEach(async () => {
    // テスト用アプリケーションを作成（サーバー起動なし）
    const canvasRepository = createCanvasRepository(prisma);
    const canvasService = createCanvasService(canvasRepository);
    const canvasHandlers = createCanvasHandlers(canvasService, canvasRepository);

    // 認証ミドルウェアを手動で適用したルートを作成
    const canvasRoutes = new Hono<{ Variables: AuthenticatedVariables }>()
      .get("/me", testAuthMiddleware, testRequireAuth, canvasHandlers.getUserCanvas)
      .post("/", testAuthMiddleware, testRequireAuth, canvasHandlers.createCanvas)
      .put(
        "/:id",
        testAuthMiddleware,
        testRequireAuth,
        zValidator("json", UpdateCanvasRequestSchema),
        canvasHandlers.updateCanvas,
      )
      .patch(
        "/:id/publish",
        testAuthMiddleware,
        testRequireAuth,
        canvasHandlers.updatePublishStatus,
      )
      .delete("/:id", testAuthMiddleware, testRequireAuth, canvasHandlers.deleteCanvas);

    app = new Hono()
      .use(
        "/*",
        cors({
          origin: "http://localhost:3000",
          credentials: true,
        }),
      )
      .route("/canvass", canvasRoutes);

    // テストユーザー作成
    testUser = await prisma.user.create({
      data: {
        email: `e2e-test-${Date.now()}@example.com`,
        name: "E2E Test User",
        role: "user",
        emailVerified: true,
      },
    });

    // セッション作成（認証用）
    const session = await prisma.session.create({
      data: {
        userId: testUser.id,
        token: `test-token-${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24時間後
      },
    });

    authCookie = `better-auth.session_token=${session.token}`;

    // テスト用キャンバス作成
    const canvas = await prisma.canvas.create({
      data: {
        userId: testUser.id,
        title: "E2E Test Canvas",
        slug: `e2e-test-${Date.now()}`,
        layoutConfig: {
          template_id: "template-01",
          background: { type: "color", color: "#ffffff" },
          items: [],
        },
        thumbnailUrl: null,
        isPublic: false,
      },
    });
    testCanvasId = canvas.id;
  });

  describe("PUT /canvass/:id - サムネイル更新", () => {
    test("サムネイルURLを設定できる", async () => {
      const thumbnailUrl = "https://example.com/test-thumbnail.jpg";

      // Act: サムネイル更新リクエスト
      const response = await app.request(`/canvass/${testCanvasId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: authCookie,
        },
        body: JSON.stringify({
          thumbnailUrl,
        }),
      });

      // Assert: レスポンス確認
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.canvas.thumbnailUrl).toBe(thumbnailUrl);

      // Assert: DB直接確認
      const updatedCanvas = await prisma.canvas.findUnique({
        where: { id: testCanvasId },
      });
      expect(updatedCanvas?.thumbnailUrl).toBe(thumbnailUrl);
    });

    test("サムネイルURLをnullに更新できる", async () => {
      // Arrange: 既存のサムネイルを設定
      await prisma.canvas.update({
        where: { id: testCanvasId },
        data: { thumbnailUrl: "https://example.com/old-thumbnail.jpg" },
      });

      // Act: サムネイルをnullに更新
      const response = await app.request(`/canvass/${testCanvasId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: authCookie,
        },
        body: JSON.stringify({
          thumbnailUrl: null,
        }),
      });

      // Assert: レスポンス確認
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.canvas.thumbnailUrl).toBeNull();

      // Assert: DB直接確認
      const updatedCanvas = await prisma.canvas.findUnique({
        where: { id: testCanvasId },
      });
      expect(updatedCanvas?.thumbnailUrl).toBeNull();
    });

    test("タイトルとサムネイルを同時に更新できる", async () => {
      const newTitle = "Updated Title";
      const thumbnailUrl = "https://example.com/new-thumbnail.jpg";

      // Act
      const response = await app.request(`/canvass/${testCanvasId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: authCookie,
        },
        body: JSON.stringify({
          title: newTitle,
          thumbnailUrl,
        }),
      });

      // Assert: レスポンス確認
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.canvas.title).toBe(newTitle);
      expect(data.data.canvas.thumbnailUrl).toBe(thumbnailUrl);

      // Assert: DB直接確認
      const updatedCanvas = await prisma.canvas.findUnique({
        where: { id: testCanvasId },
      });
      expect(updatedCanvas?.title).toBe(newTitle);
      expect(updatedCanvas?.thumbnailUrl).toBe(thumbnailUrl);
    });

    test("isPublicとサムネイルを同時に更新できる", async () => {
      const thumbnailUrl = "https://example.com/public-thumbnail.jpg";

      // Act
      const response = await app.request(`/canvass/${testCanvasId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: authCookie,
        },
        body: JSON.stringify({
          thumbnailUrl,
          isPublic: true,
        }),
      });

      // Assert: レスポンス確認
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.canvas.thumbnailUrl).toBe(thumbnailUrl);
      expect(data.data.canvas.isPublic).toBe(true);

      // Assert: DB直接確認
      const updatedCanvas = await prisma.canvas.findUnique({
        where: { id: testCanvasId },
      });
      expect(updatedCanvas?.thumbnailUrl).toBe(thumbnailUrl);
      expect(updatedCanvas?.isPublic).toBe(true);
    });

    test("認証なしの場合は401エラー", async () => {
      const response = await app.request(`/canvass/${testCanvasId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          thumbnailUrl: "https://example.com/test.jpg",
        }),
      });

      expect(response.status).toBe(401);
    });

    test("他人のキャンバスは更新できない", async () => {
      // Arrange: 別のユーザーを作成
      const anotherUser = await prisma.user.create({
        data: {
          email: `another-${Date.now()}@example.com`,
          name: "Another User",
          role: "user",
          emailVerified: true,
        },
      });

      const anotherSession = await prisma.session.create({
        data: {
          userId: anotherUser.id,
          token: `another-token-${Date.now()}`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      const anotherCookie = `better-auth.session_token=${anotherSession.token}`;

      // Act: 別のユーザーのキャンバスを更新しようとする
      const response = await app.request(`/canvass/${testCanvasId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: anotherCookie,
        },
        body: JSON.stringify({
          thumbnailUrl: "https://example.com/unauthorized.jpg",
        }),
      });

      // Assert: 権限エラー
      expect(response.status).toBe(500); // ForbiddenErrorは500で返される
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  describe("DB直接確認 - データ整合性テスト", () => {
    test("thumbnailUrlフィールドがDB���存在する", async () => {
      const canvas = await prisma.canvas.findUnique({
        where: { id: testCanvasId },
      });

      expect(canvas).toBeDefined();
      expect(canvas).toHaveProperty("thumbnailUrl");
    });

    test("thumbnailUrlの初期値はnull", async () => {
      const canvas = await prisma.canvas.findUnique({
        where: { id: testCanvasId },
      });

      expect(canvas?.thumbnailUrl).toBeNull();
    });

    test("DB直接更新が機能する", async () => {
      const testUrl = "https://example.com/direct-update.jpg";

      // Prismaで直接更新
      await prisma.canvas.update({
        where: { id: testCanvasId },
        data: { thumbnailUrl: testUrl },
      });

      // 確認
      const canvas = await prisma.canvas.findUnique({
        where: { id: testCanvasId },
      });

      expect(canvas?.thumbnailUrl).toBe(testUrl);
    });
  });
});
