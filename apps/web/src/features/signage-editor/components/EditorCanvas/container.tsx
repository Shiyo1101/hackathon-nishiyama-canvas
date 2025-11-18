/**
 * エディターキャンバス - コンテナコンポーネント
 */
"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { updateSignageAction } from "../../actions/signage-actions";
import {
  addLayoutItemAtom,
  isSavingAtom,
  layoutConfigAtom,
  selectedItemIdAtom,
  signageIdAtom,
} from "../../store/atoms";
import { draggingItemTypeAtom } from "../../store/drag-atoms";
import { EditorCanvasPresentation } from "./presentation";

type EditorCanvasProps = {
  /** 保存成功時のコールバック */
  onSaveSuccess?: () => void;
};

export const EditorCanvas = ({ onSaveSuccess }: EditorCanvasProps): React.JSX.Element => {
  const router = useRouter();
  const layout = useAtomValue(layoutConfigAtom);
  const [selectedItemId, setSelectedItemId] = useAtom(selectedItemIdAtom);
  const [isSaving, setIsSaving] = useAtom(isSavingAtom);
  const signageId = useAtomValue(signageIdAtom);
  const draggingItemType = useAtomValue(draggingItemTypeAtom);
  const addLayoutItem = useSetAtom(addLayoutItemAtom);

  /**
   * アイテムクリックハンドラー
   */
  const handleItemClick = (itemId: string): void => {
    setSelectedItemId(itemId);
  };

  /**
   * 保存ハンドラー（Server Actionを使用）
   */
  const handleSave = async (): Promise<void> => {
    if (!layout || !signageId) {
      return;
    }

    try {
      setIsSaving(true);

      // Server Actionを呼び出し
      const result = await updateSignageAction(signageId, {
        layoutConfig: layout,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      onSaveSuccess?.();
    } catch (error) {
      console.error("Failed to save signage:", error);
      alert(`保存に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * プレビューハンドラー
   */
  const handlePreview = (): void => {
    router.push("/signage/preview");
  };

  /**
   * ドロップハンドラー
   */
  const handleDrop = (event: React.DragEvent): void => {
    event.preventDefault();

    if (!layout || !draggingItemType) {
      return;
    }

    // ドロップ位置を計算
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // グリッド座標に変換
    const gridX = Math.floor((x / rect.width) * layout.grid.columns);
    const gridY = Math.floor((y / rect.height) * layout.grid.rows);

    // 新しいアイテムを追加
    addLayoutItem({
      id: nanoid(),
      type: draggingItemType,
      position: {
        x: Math.max(0, Math.min(gridX, layout.grid.columns - 2)),
        y: Math.max(0, Math.min(gridY, layout.grid.rows - 2)),
        w: 2,
        h: 2,
      },
    });
  };

  /**
   * ドラッグオーバーハンドラー
   */
  const handleDragOver = (event: React.DragEvent): void => {
    event.preventDefault();
  };

  return (
    <EditorCanvasPresentation
      layout={layout}
      selectedItemId={selectedItemId}
      isSaving={isSaving}
      onItemClick={handleItemClick}
      onSave={handleSave}
      onPreview={handlePreview}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    />
  );
};
