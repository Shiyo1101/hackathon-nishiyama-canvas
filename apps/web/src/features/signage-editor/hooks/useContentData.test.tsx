/**
 * useContentData フックのテスト
 */
import type { AnimalImage, News } from "@api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAnimalImageData, useNewsData } from "./useContentData";

// モックデータ
const mockNews: News = {
  id: "news-1",
  title: "テストニュース",
  content: "テストコンテンツ",
  summary: "テストサマリー",
  category: "お知らせ",
  imageUrl: "https://example.com/news.jpg",
  publishedAt: "2025-01-01T00:00:00.000Z",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

const mockAnimalImage: AnimalImage = {
  id: "image-1",
  animalId: "animal-1",
  imageUrl: "https://example.com/panda.jpg",
  thumbnailUrl: "https://example.com/panda-thumb.jpg",
  caption: "かわいいレッサーパンダ",
  isFeatured: true,
  createdAt: "2025-01-01T00:00:00.000Z",
};

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

describe("useNewsData", () => {
  beforeEach(() => {
    // fetchのモック
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("newsIdがundefinedの場合、データを取得しない", () => {
    const { result } = renderHook(() => useNewsData(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it("newsIdが指定されている場合、ニュースデータを取得する", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { news: mockNews },
      }),
    });

    const { result } = renderHook(() => useNewsData("news-1"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockNews);
  });

  it("APIエラー時はエラーを返す", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useNewsData("news-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it("APIレスポンスがsuccessではない場合、エラーを返す", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
      }),
    });

    const { result } = renderHook(() => useNewsData("news-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe("useAnimalImageData", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("imageIdがundefinedの場合、データを取得しない", () => {
    const { result } = renderHook(() => useAnimalImageData(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it("imageIdが指定されている場合、動物画像データを取得する", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { image: mockAnimalImage },
      }),
    });

    const { result } = renderHook(() => useAnimalImageData("image-1"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockAnimalImage);
  });

  it("APIエラー時はエラーを返す", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useAnimalImageData("image-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
