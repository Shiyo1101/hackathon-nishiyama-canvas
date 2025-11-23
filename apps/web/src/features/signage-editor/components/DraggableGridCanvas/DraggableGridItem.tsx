/**
 * ドラッグ可能なグリッドアイテム
 */
"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Edit, GripVertical, Maximize2, X } from "lucide-react";
import { useState } from "react";
import type { LayoutItem } from "@/types";
import { ContentRenderer } from "./ContentRenderer";

type DraggableGridItemProps = {
  /** アイテム */
  item: LayoutItem;
  /** グリッドのカラム数 */
  gridColumns: number;
  /** グリッドの行数 */
  gridRows: number;
  /** 選択状態 */
  isSelected: boolean;
  /** ドラッグ中 */
  isDragging: boolean;
  /** クリック時のハンドラー */
  onClick?: () => void;
  /** 削除時のハンドラー */
  onDelete?: () => void;
  /** 編集時のハンドラー */
  onEdit?: () => void;
  /** リサイズ時のハンドラー */
  onResize?: (itemId: string, newWidth: number, newHeight: number) => void;
};

export const DraggableGridItem = ({
  item,
  gridColumns,
  gridRows,
  isSelected,
  isDragging,
  onClick,
  onDelete,
  onEdit,
  onResize,
}: DraggableGridItemProps): React.JSX.Element => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
  });

  const [isResizing, setIsResizing] = useState(false);

  const { position } = item;

  // グリッド位置をパーセンテージに変換
  const left = `${(position.x / gridColumns) * 100}%`;
  const top = `${(position.y / gridRows) * 100}%`;
  const width = `${(position.w / gridColumns) * 100}%`;
  const height = `${(position.h / gridRows) * 100}%`;

  // ドラッグ時の変換スタイル
  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        transition: "none", // ドラッグ中はトランジションを無効化
      }
    : undefined;

  return (
    // biome-ignore lint/a11y/useSemanticElements: <!-- IGNORE -->
    <div
      ref={setNodeRef}
      className={`absolute cursor-move rounded-lg border-2 bg-card p-2 shadow-sm ${
        isDragging || isResizing ? "" : "transition-all"
      } ${
        isSelected
          ? "z-10 border-primary shadow-lg ring-2 ring-primary/20"
          : "border-border hover:border-primary/50"
      } ${isDragging ? "scale-105 opacity-50" : ""} ${
        isResizing ? "opacity-70 ring-4 ring-primary/40" : ""
      }`}
      style={{
        left,
        top,
        width,
        height,
        willChange: isDragging || isResizing ? "transform" : "auto",
        ...style,
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {/* ドラッグハンドル */}
      <div
        {...listeners}
        {...attributes}
        className="pointer-events-auto absolute top-1 left-1 z-20 cursor-grab rounded p-1 hover:bg-muted active:cursor-grabbing"
      >
        <GripVertical className="size-4 text-muted-foreground" />
      </div>

      {/* 削除ボタン */}
      {isSelected && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="-top-2 -right-2 pointer-events-auto absolute z-20 rounded-full bg-destructive p-1 text-destructive-foreground shadow-md transition-transform hover:scale-110"
          aria-label="削除"
        >
          <X className="size-3" />
        </button>
      )}

      {/* 編集ボタン */}
      {isSelected && onEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
          className="-bottom-2 -left-2 pointer-events-auto absolute z-20 rounded-full bg-secondary p-1 text-secondary-foreground shadow-md transition-transform hover:scale-110"
          aria-label="編集"
        >
          <Edit className="size-3" />
        </button>
      )}

      {/* リサイズハンドル */}
      {isSelected && onResize && (
        // biome-ignore lint/a11y/useSemanticElements: <!-- IGNORE -->
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();

            setIsResizing(true);

            const canvas = e.currentTarget.closest("[data-canvas]") as HTMLElement;
            if (!canvas) return;

            const canvasRect = canvas.getBoundingClientRect();
            const gridCellWidth = canvasRect.width / gridColumns;
            const gridCellHeight = canvasRect.height / gridRows;

            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = item.position.w;
            const startHeight = item.position.h;

            const handleMouseMove = (moveEvent: MouseEvent): void => {
              const deltaX = moveEvent.clientX - startX;
              const deltaY = moveEvent.clientY - startY;

              const deltaW = Math.round(deltaX / gridCellWidth);
              const deltaH = Math.round(deltaY / gridCellHeight);

              const newW = Math.max(
                1,
                Math.min(startWidth + deltaW, gridColumns - item.position.x),
              );
              const newH = Math.max(1, Math.min(startHeight + deltaH, gridRows - item.position.y));

              if (newW !== item.position.w || newH !== item.position.h) {
                onResize(item.id, newW, newH);
              }
            };

            const handleMouseUp = (): void => {
              setIsResizing(false);
              document.removeEventListener("mousemove", handleMouseMove);
              document.removeEventListener("mouseup", handleMouseUp);
            };

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
          }}
          role="button"
          tabIndex={0}
          className={`-bottom-1 -right-1 pointer-events-auto absolute z-20 cursor-nwse-resize rounded-full p-1 text-primary-foreground shadow-md transition-all ${
            isResizing
              ? "scale-125 bg-primary ring-2 ring-primary/50"
              : "bg-primary hover:scale-110 hover:shadow-lg"
          }`}
          aria-label="リサイズ"
        >
          <Maximize2 className="size-3" />
        </div>
      )}

      {/* コンテンツ表示 */}
      <div className="pointer-events-none flex size-full items-center justify-center overflow-hidden px-8 py-6">
        <ContentRenderer item={item} />
      </div>
    </div>
  );
};
