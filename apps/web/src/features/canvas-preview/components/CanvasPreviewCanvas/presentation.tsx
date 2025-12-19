/**
 * キャンバスプレビューキャンバス Presentationコンポーネント
 *
 * 読み取り専用のキャンバス表示を担当
 * DraggableGridCanvasと同様のレイアウトだが、ドラッグ&ドロップや編集機能は無効
 */
"use client";

import { ContentRenderer } from "@/features/canvas-editor/components/DraggableGridCanvas/ContentRenderer";
import type { LayoutConfig } from "@/types";

type CanvasPreviewCanvasPresentationProps = {
  /** レイアウト設定 */
  layoutConfig: LayoutConfig;
};

export const CanvasPreviewCanvasPresentation = ({
  layoutConfig,
}: CanvasPreviewCanvasPresentationProps): React.JSX.Element => {
  const { grid, background, items } = layoutConfig;

  // 背景スタイル
  const backgroundStyle =
    background.type === "color"
      ? { backgroundColor: background.value || "#ffffff" }
      : background.url
        ? {
            backgroundImage: `url(${background.url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : { backgroundColor: "#ffffff" };

  return (
    <div
      className="relative size-full overflow-hidden"
      style={{
        ...backgroundStyle,
        display: "grid",
        gridTemplateColumns: `repeat(${grid.columns}, 1fr)`,
        gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
      }}
    >
      {items.map((item) => {
        const { position } = item;

        // グリッド位置をパーセンテージに変換
        const left = `${(position.x / grid.columns) * 100}%`;
        const top = `${(position.y / grid.rows) * 100}%`;
        const width = `${(position.w / grid.columns) * 100}%`;
        const height = `${(position.h / grid.rows) * 100}%`;

        return (
          <div
            key={item.id}
            className="absolute overflow-hidden bg-card shadow-sm"
            style={{
              left,
              top,
              width,
              height,
            }}
          >
            {/* コンテンツ表示 */}
            <div className="size-full">
              <ContentRenderer item={item} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
