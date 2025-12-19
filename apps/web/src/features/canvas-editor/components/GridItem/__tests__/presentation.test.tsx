import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { LayoutItem } from "@/types";
import { GridItemPresentation } from "../presentation";

// @dnd-kit/core のモック
vi.mock("@dnd-kit/core", () => ({
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
  }),
}));

describe("GridItemPresentation", () => {
  const mockItem: LayoutItem = {
    id: "test-item-1",
    type: "news",
    position: { x: 0, y: 0, w: 4, h: 2 },
  };

  const defaultProps = {
    item: mockItem,
    isSelected: false,
    isDragging: false,
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    onClick: vi.fn(),
  };

  it("正しくレンダリングされる", () => {
    render(<GridItemPresentation {...defaultProps} />);

    expect(screen.getByText("ニュース")).toBeInTheDocument();
    expect(screen.getByText("4 × 2")).toBeInTheDocument();
  });

  it("選択状態が正しく反映される", () => {
    const { container } = render(<GridItemPresentation {...defaultProps} isSelected={true} />);

    const itemElement = container.firstChild as HTMLElement;
    expect(itemElement).toHaveStyle({ border: "2px solid #3b82f6" });
  });

  it("ドラッグ中の透明度が変わる", () => {
    const { container } = render(<GridItemPresentation {...defaultProps} isDragging={true} />);

    const itemElement = container.firstChild as HTMLElement;
    expect(itemElement).toHaveStyle({ opacity: "0.5" });
  });

  it("削除ボタンをクリックするとonDeleteが呼ばれる", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<GridItemPresentation {...defaultProps} onDelete={onDelete} />);

    const deleteButton = screen.getByRole("button", { name: "削除" });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("編集ボタンをクリックするとonEditが呼ばれる", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(<GridItemPresentation {...defaultProps} onEdit={onEdit} />);

    const editButton = screen.getByRole("button", { name: "編集" });
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("アイテムをクリックするとonClickが呼ばれる", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    const { container } = render(<GridItemPresentation {...defaultProps} onClick={onClick} />);

    // 外側のdiv要素をクリック（最初のdiv要素）
    const itemElement = container.querySelector('div[role="button"]');
    if (!itemElement) throw new Error("Item element not found");

    await user.click(itemElement);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("テキストコンテンツが表示される", () => {
    const textItem: LayoutItem = {
      ...mockItem,
      type: "text",
      textContent: "テストテキスト",
    };

    render(<GridItemPresentation {...defaultProps} item={textItem} />);

    expect(screen.getByText("テストテキスト")).toBeInTheDocument();
  });

  describe("コンテンツタイプに応じたラベル表示", () => {
    it("newsタイプの場合", () => {
      render(<GridItemPresentation {...defaultProps} item={{ ...mockItem, type: "news" }} />);
      expect(screen.getByText("ニュース")).toBeInTheDocument();
    });

    it("animalタイプの場合", () => {
      render(<GridItemPresentation {...defaultProps} item={{ ...mockItem, type: "animal" }} />);
      expect(screen.getByText("動物情報")).toBeInTheDocument();
    });

    it("textタイプの場合", () => {
      render(<GridItemPresentation {...defaultProps} item={{ ...mockItem, type: "text" }} />);
      expect(screen.getByText("テキスト")).toBeInTheDocument();
    });

    it("user_imageタイプの場合", () => {
      render(<GridItemPresentation {...defaultProps} item={{ ...mockItem, type: "user_image" }} />);
      expect(screen.getByText("ユーザー画像")).toBeInTheDocument();
    });
  });
});
