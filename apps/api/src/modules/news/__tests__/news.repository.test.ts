import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../../lib/db";
import { createNewsRepository } from "../news.repository";

describe("NewsRepository", () => {
  const newsRepository = createNewsRepository(prisma);

  beforeEach(async () => {
    // テストデータをクリーンアップ
    await prisma.news.deleteMany();
  });

  describe("findMany", () => {
    it("全ニュースを取得できる", async () => {
      // Arrange: テストデータを作成
      await prisma.news.createMany({
        data: [
          {
            title: "ニュース1",
            content: "コンテンツ1",
            summary: "サマリー1",
            category: "お知らせ",
            publishedAt: new Date("2025-01-01"),
          },
          {
            title: "ニュース2",
            content: "コンテンツ2",
            summary: "サマリー2",
            category: "イベント",
            publishedAt: new Date("2025-01-02"),
          },
        ],
      });

      // Act: ニュース一覧を取得
      const news = await newsRepository.findMany();

      // Assert: 2件取得できること、publishedAtの降順であること
      expect(news).toHaveLength(2);
      expect(news[0].title).toBe("ニュース2"); // 新しい方が先
      expect(news[1].title).toBe("ニュース1");
    });

    it("カテゴリでフィルタできる", async () => {
      // Arrange
      await prisma.news.createMany({
        data: [
          {
            title: "お知らせ1",
            content: "コンテンツ",
            category: "お知らせ",
            publishedAt: new Date(),
          },
          {
            title: "イベント1",
            content: "コンテンツ",
            category: "イベント",
            publishedAt: new Date(),
          },
        ],
      });

      // Act
      const news = await newsRepository.findMany({ category: "お知らせ" });

      // Assert
      expect(news).toHaveLength(1);
      expect(news[0].category).toBe("お知らせ");
    });

    it("limit, offsetで件数を制限できる", async () => {
      // Arrange
      await prisma.news.createMany({
        data: Array.from({ length: 5 }, (_, i) => ({
          title: `ニュース${i + 1}`,
          content: "コンテンツ",
          publishedAt: new Date(`2025-01-${String(i + 1).padStart(2, "0")}`),
        })),
      });

      // Act: limit=2, offset=1
      const news = await newsRepository.findMany({ limit: 2, offset: 1 });

      // Assert: 2件取得、2番目と3番目
      expect(news).toHaveLength(2);
      expect(news[0].title).toBe("ニュース4"); // publishedAt降順
      expect(news[1].title).toBe("ニュース3");
    });
  });

  describe("findById", () => {
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
      const news = await newsRepository.findById(created.id);

      // Assert
      expect(news).not.toBeNull();
      expect(news?.title).toBe("テストニュース");
    });

    it("存在しないIDの場合nullを返す", async () => {
      // Act
      const news = await newsRepository.findById("non-existent-id");

      // Assert
      expect(news).toBeNull();
    });
  });

  describe("count", () => {
    it("ニュースの総数を取得できる", async () => {
      // Arrange
      await prisma.news.createMany({
        data: [
          { title: "ニュース1", content: "コンテンツ" },
          { title: "ニュース2", content: "コンテンツ" },
          { title: "ニュース3", content: "コンテンツ" },
        ],
      });

      // Act
      const count = await newsRepository.count();

      // Assert
      expect(count).toBe(3);
    });

    it("カテゴリでフィルタした総数を取得できる", async () => {
      // Arrange
      await prisma.news.createMany({
        data: [
          { title: "お知らせ1", content: "コンテンツ", category: "お知らせ" },
          { title: "お知らせ2", content: "コンテンツ", category: "お知らせ" },
          { title: "イベント1", content: "コンテンツ", category: "イベント" },
        ],
      });

      // Act
      const count = await newsRepository.count("お知らせ");

      // Assert
      expect(count).toBe(2);
    });
  });
});
