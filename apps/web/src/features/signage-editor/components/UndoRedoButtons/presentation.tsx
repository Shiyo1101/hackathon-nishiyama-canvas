/**
 * Undo/Redoボタン - プレゼンテーションコンポーネント
 *
 * 編集履歴を元に戻す/やり直すためのボタングループ
 * キーボードショートカット: Ctrl+Z (Undo), Ctrl+Y (Redo)
 */
"use client";

import { Redo, Undo } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useHistory } from "../../hooks";

export const UndoRedoButtonsPresentation = (): React.JSX.Element => {
  const { undo, redo, canUndo, canRedo } = useHistory();

  /**
   * キーボードショートカットのイベントリスナー
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      // Ctrl+Z または Cmd+Z (Mac) で Undo
      if ((event.ctrlKey || event.metaKey) && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        if (canUndo) {
          undo();
        }
      }

      // Ctrl+Y または Cmd+Shift+Z (Mac) で Redo
      if (
        ((event.ctrlKey || event.metaKey) && event.key === "y") ||
        ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "z")
      ) {
        event.preventDefault();
        if (canRedo) {
          redo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return (): void => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo, canUndo, canRedo]);

  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={undo}
        disabled={!canUndo}
        title="元に戻す (Ctrl+Z)"
      >
        <Undo className="size-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={redo}
        disabled={!canRedo}
        title="やり直す (Ctrl+Y)"
      >
        <Redo className="size-4" />
      </Button>
    </div>
  );
};
