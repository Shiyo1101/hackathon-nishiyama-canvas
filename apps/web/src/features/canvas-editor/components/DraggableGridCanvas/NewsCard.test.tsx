/**
 * NewsCard コンポーネントのテスト
 */
import type { News } from "@api";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NewsCard } from "./NewsCard";

const mockNews: News = {
  id: "news-1",
  title: "テストニュース",
  content: "テストコンテンツの詳細説明",
  summary: "テストサマリー",
  category: "お知らせ",
  imageUrl: "https://example.com/news.jpg",
  publishedAt: "2025-01-15T00:00:00.000Z",
  createdAt: "2025-01-15T00:00:00.000Z",
  updatedAt: "2025-01-15T00:00:00.000Z",
};

describe("NewsCard", () => {
  it("ニュースタイトルを表示する", () => {
    render(<NewsCard news={mockNews} />);

    expect(screen.getByText("テストニュース")).toBeInTheDocument();
  });

  it("ニュース本文を表示する", () => {
    render(<NewsCard news={mockNews} />);

    expect(screen.getByText("テストコンテンツの詳細説明")).toBeInTheDocument();
  });

  it("公開日を日本語フォーマットで表示する", () => {
    render(<NewsCard news={mockNews} />);

    expect(screen.getByText(/2025年1月15日/)).toBeInTheDocument();
  });

  it("画像URLがある場合、画像を表示する", () => {
    render(<NewsCard news={mockNews} />);

    const image = screen.getByAltText("テストニュース");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src");
  });

  it("画像URLがない場合でも正常に表示する", () => {
    const newsWithoutImage = { ...mockNews, imageUrl: null };
    render(<NewsCard news={newsWithoutImage} />);

    expect(screen.getByText("テストニュース")).toBeInTheDocument();
    expect(screen.queryByAltText("テストニュース")).not.toBeInTheDocument();
  });

  it("本文がない場合でも正常に表示する", () => {
    const newsWithoutContent = { ...mockNews, content: "" };
    render(<NewsCard news={newsWithoutContent} />);

    expect(screen.getByText("テストニュース")).toBeInTheDocument();
    expect(screen.queryByText("テストコンテンツの詳細説明")).not.toBeInTheDocument();
  });
});
