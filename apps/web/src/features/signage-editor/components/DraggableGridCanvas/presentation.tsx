/**
 * ドラッグ可能なグリッドキャンバス - プレゼンテーション
 *
 * @dnd-kitを使用してアイテムの移動・リサイズを実装
 */
"use client";

import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useAtom, useAtomValue } from "jotai";
import { forwardRef, useRef, useState } from "react";
import type { LayoutConfig, LayoutItem } from "@/types";
import { useHistory } from "../../hooks";
import { layoutConfigAtom, selectedItemIdAtom, updateLayoutItemAtom } from "../../store/atoms";
import { DraggableGridItem } from "./DraggableGridItem";

type DraggableGridCanvasPresentationProps = {
  /** アイテムクリック時のハンドラー */
  onItemClick?: (itemId: string) => void;
  /** アイテム削除時のハンドラー */
  onItemDelete?: (itemId: string) => void;
  /** アイテム編集時のハンドラー */
  onItemEdit?: (itemId: string) => void;
};

export const DraggableGridCanvasPresentation = ({
  onItemClick,
  onItemDelete,
  onItemEdit,
}: DraggableGridCanvasPresentationProps): React.JSX.Element => {
  const layout = useAtomValue(layoutConfigAtom);
  const [selectedItemId, setSelectedItemId] = useAtom(selectedItemIdAtom);
  const [, updateLayoutItem] = useAtom(updateLayoutItemAtom);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { pushHistory } = useHistory();

  // センサー設定（マウスとタッチ）
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // 8px移動したらドラッグ開始
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms長押ししたらドラッグ開始
        tolerance: 5,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent): void => {
    const itemId = event.active.id as string;
    // ドラッグ開始時に現在の状態を履歴に保存
    pushHistory();
    setDraggedItemId(itemId);
    setSelectedItemId(itemId);
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, delta } = event;
    const itemId = active.id as string;

    if (!layout) {
      setDraggedItemId(null);
      return;
    }

    // 移動量を計算
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) {
      setDraggedItemId(null);
      return;
    }

    // 現在のアイテムを取得
    const currentItem = layout.items.find((item) => item.id === itemId);
    if (!currentItem) {
      setDraggedItemId(null);
      return;
    }

    // グリッド単位での移動量を計算
    const gridColumnWidth = canvasRect.width / layout.grid.columns;
    const gridRowHeight = canvasRect.height / layout.grid.rows;

    const deltaColumns = Math.round(delta.x / gridColumnWidth);
    const deltaRows = Math.round(delta.y / gridRowHeight);

    // 新しい位置を計算（グリッド境界内に収める）
    const newX = Math.max(
      0,
      Math.min(currentItem.position.x + deltaColumns, layout.grid.columns - currentItem.position.w),
    );
    const newY = Math.max(
      0,
      Math.min(currentItem.position.y + deltaRows, layout.grid.rows - currentItem.position.h),
    );

    // 位置が変わった場合のみ更新
    if (newX !== currentItem.position.x || newY !== currentItem.position.y) {
      const updatedItem: LayoutItem = {
        ...currentItem,
        position: {
          ...currentItem.position,
          x: newX,
          y: newY,
        },
      };

      updateLayoutItem(updatedItem);
    }

    setDraggedItemId(null);
  };

  const handleDragCancel = (): void => {
    setDraggedItemId(null);
  };

  const handleItemResize = (itemId: string, newWidth: number, newHeight: number): void => {
    if (!layout) return;

    const currentItem = layout.items.find((item) => item.id === itemId);
    if (!currentItem) return;

    // リサイズ開始時に現在の状態を履歴に保存（サイズが変わった場合のみ）
    if (currentItem.position.w !== newWidth || currentItem.position.h !== newHeight) {
      pushHistory();
    }

    const updatedItem: LayoutItem = {
      ...currentItem,
      position: {
        ...currentItem.position,
        w: newWidth,
        h: newHeight,
      },
    };

    updateLayoutItem(updatedItem);
  };

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

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <CanvasContent
        ref={canvasRef}
        layout={layout}
        selectedItemId={selectedItemId}
        draggedItemId={draggedItemId}
        onItemClick={onItemClick}
        onItemDelete={onItemDelete}
        onItemEdit={onItemEdit}
        onItemResize={handleItemResize}
      />
    </DndContext>
  );
};

type CanvasContentProps = {
  /** レイアウト設定 */
  layout: LayoutConfig;
  /** 選択中のアイテムID */
  selectedItemId: string | null;
  /** ドラッグ中のアイテムID */
  draggedItemId: string | null;
  /** アイテムクリック時のハンドラー */
  onItemClick?: (itemId: string) => void;
  /** アイテム削除時のハンドラー */
  onItemDelete?: (itemId: string) => void;
  /** アイテム編集時のハンドラー */
  onItemEdit?: (itemId: string) => void;
  /** アイテムリサイズ時のハンドラー */
  onItemResize?: (itemId: string, newWidth: number, newHeight: number) => void;
};

const CanvasContent = forwardRef<HTMLDivElement, CanvasContentProps>(
  (
    { layout, selectedItemId, draggedItemId, onItemClick, onItemDelete, onItemEdit, onItemResize },
    ref,
  ) => {
    const { grid, background, items } = layout;

    return (
      <div
        ref={ref}
        data-canvas
        className="relative h-full w-full rounded-lg border-2 border-muted-foreground/25 border-dashed bg-muted/10"
        style={{
          aspectRatio: "16 / 9",
          backgroundColor: background.type === "color" ? background.value : undefined,
          backgroundImage: background.type === "image" ? `url(${background.url})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* グリッドガイドライン（開発時のみ表示） */}
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: grid.rows + 1 }, (_, i) => i).map((rowIndex) => (
            <div
              key={`grid-row-${rowIndex}`}
              className="absolute right-0 left-0 border-muted-foreground/10 border-t"
              style={{
                top: `${(rowIndex / grid.rows) * 100}%`,
              }}
            />
          ))}
          {Array.from({ length: grid.columns + 1 }, (_, i) => i).map((colIndex) => (
            <div
              key={`grid-col-${colIndex}`}
              className="absolute top-0 bottom-0 border-muted-foreground/10 border-l"
              style={{
                left: `${(colIndex / grid.columns) * 100}%`,
              }}
            />
          ))}
        </div>

        {/* ドラッグ可能なアイテム */}
        {items.map((item) => (
          <DraggableGridItem
            key={item.id}
            item={item}
            gridColumns={grid.columns}
            gridRows={grid.rows}
            isSelected={selectedItemId === item.id}
            isDragging={draggedItemId === item.id}
            onClick={() => onItemClick?.(item.id)}
            onDelete={() => onItemDelete?.(item.id)}
            onEdit={() => onItemEdit?.(item.id)}
            onResize={onItemResize}
          />
        ))}

        {/* 空のキャンバスメッセージ */}
        {items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">左側のツールバーからコンテンツを選択して配置</p>
            </div>
          </div>
        )}
      </div>
    );
  },
);

CanvasContent.displayName = "CanvasContent";
