/**
 * エディターツールバー - コンテナコンポーネント
 */
"use client";

import { useAtomValue, useSetAtom } from "jotai";
import type { ContentItemType } from "@/types";
import { layoutConfigAtom } from "../../store/atoms";
import { draggingItemTypeAtom } from "../../store/drag-atoms";
import { EditorToolbarPresentation } from "./presentation";

export const EditorToolbar = (): React.JSX.Element => {
  const layout = useAtomValue(layoutConfigAtom);
  const setDraggingItemType = useSetAtom(draggingItemTypeAtom);

  const handleDragStart = (type: ContentItemType, event: React.DragEvent): void => {
    setDraggingItemType(type);
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("text/plain", type);
  };

  const handleDragEnd = (): void => {
    setDraggingItemType(null);
  };

  return (
    <EditorToolbarPresentation
      layout={layout}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    />
  );
};
