/**
 * AnimalImageCard コンポーネントのテスト
 */
import type { AnimalImage } from "@api";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnimalImageCard } from "./AnimalImageCard";

const mockAnimalImage: AnimalImage = {
  id: "image-1",
  animalId: "animal-1",
  imageUrl: "https://example.com/panda.jpg",
  thumbnailUrl: "https://example.com/panda-thumb.jpg",
  caption: "かわいいレッサーパンダ",
  isFeatured: true,
  createdAt: "2025-01-15T00:00:00.000Z",
};

describe("AnimalImageCard", () => {
  it("動物画像を表示する", () => {
    render(<AnimalImageCard image={mockAnimalImage} />);

    const image = screen.getByAltText("かわいいレッサーパンダ");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src");
  });

  it("キャプションを表示する", () => {
    render(<AnimalImageCard image={mockAnimalImage} />);

    expect(screen.getByText("かわいいレッサーパンダ")).toBeInTheDocument();
  });

  it("キャプションがない場合、デフォルトのalt textを使用する", () => {
    const imageWithoutCaption = { ...mockAnimalImage, caption: null };
    render(<AnimalImageCard image={imageWithoutCaption} />);

    const image = screen.getByAltText("動物画像");
    expect(image).toBeInTheDocument();
    expect(screen.queryByText("かわいいレッサーパンダ")).not.toBeInTheDocument();
  });

  it("キャプションがない場合、キャプション表示エリアを表示しない", () => {
    const imageWithoutCaption = { ...mockAnimalImage, caption: null };
    const { container } = render(<AnimalImageCard image={imageWithoutCaption} />);

    const captionContainer = container.querySelector(".bg-background\\/95");
    expect(captionContainer).not.toBeInTheDocument();
  });
});
