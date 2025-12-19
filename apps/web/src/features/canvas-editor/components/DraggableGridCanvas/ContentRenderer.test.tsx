/**
 * ContentRenderer コンポーネントのテスト
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LayoutItem } from "@/types";
import { ContentRenderer } from "./ContentRenderer";

// React Queryのwrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

// モックデータ
const mockNewsItem: LayoutItem = {
  id: "item-1",
  type: "news",
  contentId: "news-1",
  position: { x: 0, y: 0, w: 2, h: 2 },
};

const mockAnimalItem: LayoutItem = {
  id: "item-2",
  type: "animal",
  contentId: "animal-1",
  position: { x: 2, y: 0, w: 2, h: 2 },
};

const mockTextItem: LayoutItem = {
  id: "item-3",
  type: "text",
  textContent: "テストテキスト",
  position: { x: 0, y: 2, w: 2, h: 1 },
};

const mockPlaceholderItem: LayoutItem = {
  id: "item-4",
  type: "news",
  // contentIdなし
  position: { x: 2, y: 2, w: 2, h: 1 },
};

describe("ContentRenderer", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it("テキストアイテムを正しく表示する", () => {
    render(<ContentRenderer item={mockTextItem} />, { wrapper: createWrapper() });

    expect(screen.getByText("テストテキスト")).toBeInTheDocument();
  });

  it("contentIdがない場合、プレースホルダーを表示する", () => {
    render(<ContentRenderer item={mockPlaceholderItem} />, { wrapper: createWrapper() });

    expect(screen.getByText("ニュース")).toBeInTheDocument();
  });

  it("ニュースアイテムのローディング状態を表示する", () => {
    // fetchを遅延させてローディング状態をテスト
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                success: true,
                data: {
                  news: {
                    id: "news-1",
                    title: "テストニュース",
                    content: "テストコンテンツ",
                    publishedAt: "2025-01-01T00:00:00.000Z",
                  },
                },
              }),
            });
          }, 100);
        }),
    );

    render(<ContentRenderer item={mockNewsItem} />, { wrapper: createWrapper() });

    // ローディングスケルトンが表示されている
    const skeleton = document.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();
  });

  it("ニュースデータ取得成功時、NewsCardを表示する", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          news: {
            id: "news-1",
            title: "テストニュース",
            content: "テストコンテンツ",
            summary: null,
            category: null,
            imageUrl: null,
            publishedAt: "2025-01-01T00:00:00.000Z",
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-01T00:00:00.000Z",
          },
        },
      }),
    });

    render(<ContentRenderer item={mockNewsItem} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("テストニュース")).toBeInTheDocument();
    });
  });

  it("ニュースデータ取得失敗時、エラーメッセージを表示する", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<ContentRenderer item={mockNewsItem} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("ニュースの取得に失敗しました")).toBeInTheDocument();
    });
  });

  it("動物画像データ取得成功時、AnimalImageCardを表示する", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          image: {
            id: "animal-1",
            animalId: "animal-1",
            imageUrl: "https://example.com/panda.jpg",
            thumbnailUrl: null,
            caption: "テストキャプション",
            isFeatured: true,
            createdAt: "2025-01-01T00:00:00.000Z",
          },
        },
      }),
    });

    render(<ContentRenderer item={mockAnimalItem} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("テストキャプション")).toBeInTheDocument();
    });
  });

  it("動物画像データ取得失敗時、エラーメッセージを表示する", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<ContentRenderer item={mockAnimalItem} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("画像の取得に失敗しました")).toBeInTheDocument();
    });
  });
});
