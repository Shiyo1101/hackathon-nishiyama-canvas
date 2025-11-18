/**
 * エディターキャンバス - プレゼンテーションコンポーネント
 *
 * 右側のメインエリアに表示され、サイネージのプレビューと編集を行う
 */

import { Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import type { LayoutConfig, LayoutItem } from "@/types";

type EditorCanvasPresentationProps = {
  /** 現在のレイアウト設定 */
  layout: LayoutConfig | null;
  /** 選択中のアイテムID */
  selectedItemId: string | null;
  /** 保存中フラグ */
  isSaving: boolean;
  /** アイテムクリック時のハンドラー */
  onItemClick?: (itemId: string) => void;
  /** 保存ボタンクリック時のハンドラー */
  onSave?: () => void;
  /** プレビューボタンクリック時のハンドラー */
  onPreview?: () => void;
  /** ドロップエリアのハンドラー */
  onDrop?: (event: React.DragEvent) => void;
  onDragOver?: (event: React.DragEvent) => void;
};

export const EditorCanvasPresentation = ({
  layout,
  selectedItemId,
  isSaving,
  onItemClick,
  onSave,
  onPreview,
  onDrop,
  onDragOver,
}: EditorCanvasPresentationProps): React.JSX.Element => {
  if (!layout) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-current border-r-transparent border-solid" />
          <p className="text-muted-foreground">レイアウトを読み込み中...</p>
        </div>
      </div>
    );
  }

  const { grid, background, items } = layout;

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <h2 className="font-semibold text-lg">サイネージエディター</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onPreview}>
            <Eye className="mr-2 size-4" />
            プレビュー
          </Button>
          <Button size="sm" onClick={onSave} disabled={isSaving}>
            <Save className="mr-2 size-4" />
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </div>
      </CardHeader>

      {/* キャンバスエリア */}
      <CardContent className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-6xl">
          {/* グリッドコンテナ */}
          <section
            aria-label="サイネージエディターキャンバス"
            className="relative rounded-lg border-2 border-muted-foreground/25 border-dashed bg-muted/10"
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              backgroundColor: background.type === "color" ? background.value : undefined,
              backgroundImage: background.type === "image" ? `url(${background.url})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            {/* グリッドアイテム */}
            {items.map((item) => (
              <GridItemPreview
                key={item.id}
                item={item}
                gridColumns={grid.columns}
                gridRows={grid.rows}
                isSelected={selectedItemId === item.id}
                onClick={() => onItemClick?.(item.id)}
              />
            ))}

            {/* 空のキャンバスメッセージ */}
            {items.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">左側のツールバーからコンテンツをドラッグ&ドロップ</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </CardContent>
    </div>
  );
};

/**
 * グリッドアイテムのプレビューコンポーネント
 */
type GridItemPreviewProps = {
  item: LayoutItem;
  gridColumns: number;
  gridRows: number;
  isSelected: boolean;
  onClick?: () => void;
};

const GridItemPreview = ({
  item,
  gridColumns,
  gridRows,
  isSelected,
  onClick,
}: GridItemPreviewProps): React.JSX.Element => {
  const { position, type } = item;

  // グリッド位置をパーセンテージに変換
  const left = `${(position.x / gridColumns) * 100}%`;
  const top = `${(position.y / gridRows) * 100}%`;
  const width = `${(position.w / gridColumns) * 100}%`;
  const height = `${(position.h / gridRows) * 100}%`;

  // タイプに応じた表示内容
  const getContent = (): string => {
    switch (type) {
      case "news":
        return "ニュース";
      case "animal":
        return "動物情報";
      case "text":
        return item.textContent ?? "テキスト";
      case "image":
        return "公式画像";
      case "user_image":
        return "自分の画像";
      default:
        return "アイテム";
    }
  };

  return (
    <button
      type="button"
      className={`absolute cursor-pointer rounded border-2 bg-card p-2 transition-all ${
        isSelected ? "z-10 border-primary shadow-lg" : "border-border hover:border-primary/50"
      }`}
      style={{
        left,
        top,
        width,
        height,
      }}
      onClick={onClick}
    >
      <div className="flex size-full items-center justify-center text-center text-sm">
        <span className="truncate">{getContent()}</span>
      </div>
    </button>
  );
};
