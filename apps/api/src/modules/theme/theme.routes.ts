import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { prisma } from "../../lib/db";
import { createThemeSchema, updateThemeSchema } from "../../types/theme";
import { createThemeRepository } from "./theme.repository";
import { createThemeService } from "./theme.service";

export const createThemeRoutes = () => {
  const app = new Hono();

  const repository = createThemeRepository(prisma);
  const service = createThemeService(repository);

  // GET /themes - テーマ一覧取得
  app.get("/", async (c) => {
    try {
      const themes = await service.getAllThemes();

      return c.json(themes);
    } catch (error) {
      console.error("テーマ一覧取得エラー:", error);
      return c.json({ error: "テーマ一覧の取得に失敗しました" }, 500);
    }
  });

  // GET /themes/default - デフォルトテーマ取得
  app.get("/default", async (c) => {
    try {
      const theme = await service.getDefaultTheme();

      return c.json(theme);
    } catch (error) {
      console.error("デフォルトテーマ取得エラー:", error);
      return c.json({ error: "デフォルトテーマの取得に失敗しました" }, 500);
    }
  });

  // GET /themes/:id - テーマ詳細取得
  app.get("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const theme = await service.getThemeById(id);

      return c.json(theme);
    } catch (error) {
      console.error("テーマ取得エラー:", error);
      if (error instanceof Error && error.message === "テーマが見つかりません") {
        return c.json({ error: error.message }, 404);
      }
      return c.json({ error: "テーマの取得に失敗しました" }, 500);
    }
  });

  // POST /themes - テーマ作成（管理者のみ）
  app.post("/", zValidator("json", createThemeSchema), async (c) => {
    try {
      const input = c.req.valid("json");
      const theme = await service.createTheme(input);

      return c.json(theme, 201);
    } catch (error) {
      console.error("テーマ作成エラー:", error);
      return c.json({ error: "テーマの作成に失敗しました" }, 500);
    }
  });

  // PUT /themes/:id - テーマ更新（管理者のみ）
  app.put("/:id", zValidator("json", updateThemeSchema), async (c) => {
    try {
      const id = c.req.param("id");
      const input = c.req.valid("json");
      const theme = await service.updateTheme(id, input);

      return c.json(theme);
    } catch (error) {
      console.error("テーマ更新エラー:", error);
      if (error instanceof Error && error.message === "テーマが見つかりません") {
        return c.json({ error: error.message }, 404);
      }
      return c.json({ error: "テーマの更新に失敗しました" }, 500);
    }
  });

  // DELETE /themes/:id - テーマ削除（管理者のみ）
  app.delete("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      await service.deleteTheme(id);

      return c.json({ message: "テーマを削除しました" });
    } catch (error) {
      console.error("テーマ削除エラー:", error);
      if (error instanceof Error) {
        if (
          error.message === "テーマが見つかりません" ||
          error.message === "デフォルトテーマは削除できません"
        ) {
          return c.json({ error: error.message }, 400);
        }
      }
      return c.json({ error: "テーマの削除に失敗しました" }, 500);
    }
  });

  return app;
};
