"use client";

import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import type { GridConfig, LayoutItem } from "@/types";
import { GridItem } from "../GridItem";

type SignageGridPresentationProps = {
  /** グリッド設定 */
  gridConfig: GridConfig;
  /** レイアウトアイテム */
  items: LayoutItem[];
  /** アイテム更新用のコールバック  */
  onItemsChangeAction: (items: LayoutItem[]) => void;
  /** アイテム削除時のコールバック */
  onItemDeleteAction: (itemId: string) => void;
  /** アイテム編集時のコールバック */
  onItemEditAction: (itemId: string) => void;
  /** アイテム選択時のコールバック */
  onItemSelectAction: (itemId: string | null) => void;
  /** 選択中のアイテムID */
  selectedItemId: string | null;
};

export const SignageGridPresentation = ({
  gridConfig,
  items,
  onItemsChangeAction,
  onItemDeleteAction,
  onItemEditAction,
  onItemSelectAction,
  selectedItemId,
}: SignageGridPresentationProps): React.JSX.Element => {
  const [activeId, setActiveId] = useState<string | null>(null);

  // ドラッグセンサー設定
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10, // 10px移動したらドラッグ開始
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250, // 250ms長押しでドラッグ開始
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  /**
   * ドラッグ開始
   */
  const handleDragStart = (event: DragStartEvent): void => {
    const { active } = event;
    setActiveId(active.id as string);
    onItemSelectAction(active.id as string);
  };

  /**
   * ドラッグ中 (リアルタイムプレビュー用)
   */
  const handleDragOver = (_event: DragOverEvent): void => {
    // 将来的にリアルタイムプレビューを実装する場合はここで処理
  };

  /**
   * ドラッグ終了 - グリッドスナップ処理
   */
  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, delta } = event;
    setActiveId(null);

    if (!delta.x && !delta.y) {
      return; // 移動していない場合は処理しない
    }

    const itemId = active.id as string;
    const item = items.find((i) => i.id === itemId);

    if (!item) {
      return;
    }

    // グリッドのセルサイズを計算 (16:9 アスペクト比を想定)
    const gridWidth = 1920; // 仮想グリッド幅
    const gridHeight = 1080; // 仮想グリッド高さ
    const cellWidth = gridWidth / gridConfig.columns;
    const cellHeight = gridHeight / gridConfig.rows;

    // ピクセル移動量をグリッド単位に変換
    const gridDeltaX = Math.round(delta.x / cellWidth);
    const gridDeltaY = Math.round(delta.y / cellHeight);

    // 新しい位置を計算
    let newX = item.position.x + gridDeltaX;
    let newY = item.position.y + gridDeltaY;

    // グリッドの範囲内に制限
    newX = Math.max(0, Math.min(newX, gridConfig.columns - item.position.w));
    newY = Math.max(0, Math.min(newY, gridConfig.rows - item.position.h));

    // アイテムの位置を更新
    const updatedItems = items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            position: {
              ...item.position,
              x: newX,
              y: newY,
            },
          }
        : item,
    );

    onItemsChangeAction(updatedItems);
  };

  /**
   * グリッドのスタイルを計算
   */
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`,
    gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
    gap: `${gridConfig.gap ?? 8}px`,
    width: "100%",
    aspectRatio: "16 / 9",
    position: "relative",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    padding: "16px",
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div style={gridStyle}>
        {items.map((item) => (
          <GridItem
            key={item.id}
            item={item}
            isSelected={selectedItemId === item.id}
            isDragging={activeId === item.id}
            onDelete={() => onItemDeleteAction(item.id)}
            onEdit={() => onItemEditAction(item.id)}
            onClick={() => onItemSelectAction(item.id)}
          />
        ))}
      </div>
    </DndContext>
  );
};
