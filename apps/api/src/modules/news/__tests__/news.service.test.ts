import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../../lib/db";
import { createNewsRepository } from "../news.repository";
import { createNewsService } from "../news.service";

describe("NewsService", () => {
  const newsRepository = createNewsRepository(prisma);
  const newsService = createNewsService(newsRepository);

  beforeEach(async () => {
    await prisma.news.deleteMany();
  });

  describe("getNewsList", () => {
    it("ニュース一覧とメタデータを取得できる", async () => {
      // Arrange
      await prisma.news.createMany({
        data: [
          {
            title: "ニュース1",
            content: "コンテンツ1",
            publishedAt: new Date("2025-01-02"),
          },
          {
            title: "ニュース2",
            content: "コンテンツ2",
            publishedAt: new Date("2025-01-01"),
          },
        ],
      });

      // Act
      const result = await newsService.getNewsList();

      // Assert
      expect(result.news).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.limit).toBe(20); // デフォルト値
      expect(result.offset).toBe(0); // デフォルト値
      expect(result.news[0].title).toBe("ニュース1"); // publishedAt降順
    });

    it("カテゴリでフィルタできる", async () => {
      // Arrange
      await prisma.news.createMany({
        data: [
          {
            title: "お知らせ1",
            content: "コンテンツ",
            category: "お知らせ",
          },
          {
            title: "イベント1",
            content: "コンテンツ",
            category: "イベント",
          },
        ],
      });

      // Act
      const result = await newsService.getNewsList({ category: "お知らせ" });

      // Assert
      expect(result.news).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.news[0].category).toBe("お知らせ");
    });

    it("limit, offsetを指定できる", async () => {
      // Arrange
      await prisma.news.createMany({
        data: Array.from({ length: 5 }, (_, i) => ({
          title: `ニュース${i + 1}`,
          content: "コンテンツ",
          publishedAt: new Date(`2025-01-${String(5 - i).padStart(2, "0")}`),
        })),
      });

      // Act
      const result = await newsService.getNewsList({ limit: 2, offset: 1 });

      // Assert
      expect(result.news).toHaveLength(2);
      expect(result.total).toBe(5);
      expect(result.limit).toBe(2);
      expect(result.offset).toBe(1);
      expect(result.news[0].title).toBe("ニュース2");
      expect(result.news[1].title).toBe("ニュース3");
    });
  });

  describe("getNewsById", () => {
    it("IDでニュースを取得できる", async () => {
      // Arrange
      const created = await prisma.news.create({
        data: {
          title: "テストニュース",
          content: "テストコンテンツ",
          summary: "テストサマリー",
        },
      });

      // Act
      const news = await newsService.getNewsById(created.id);

      // Assert
      expect(news).not.toBeNull();
      expect(news?.title).toBe("テストニュース");
      expect(news?.summary).toBe("テストサマリー");
    });

    it("存在しないIDの場合nullを返す", async () => {
      // Act
      const news = await newsService.getNewsById("non-existent-id");

      // Assert
      expect(news).toBeNull();
    });
  });
});
