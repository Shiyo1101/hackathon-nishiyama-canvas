/**
 * Undo/Redo履歴管理のためのカスタムフック
 */
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { layoutItemsAtom, updateLayoutItemsAtom } from "../store/atoms";
import {
  historyStateAtom,
  pushHistoryAtom,
  pushRedoStackAtom,
  pushUndoStackAtom,
  redoAtom,
  undoAtom,
} from "../store/history-atoms";

/**
 * 履歴管理フックの戻り値
 */
type UseHistoryResult = {
  /** 現在の状態を履歴に追加 */
  pushHistory: () => void;
  /** 一つ前の状態に戻す */
  undo: () => void;
  /** 元に戻した操作をやり直す */
  redo: () => void;
  /** Undo可能かどうか */
  canUndo: boolean;
  /** Redo可能かどうか */
  canRedo: boolean;
  /** Undoスタックの件数 */
  undoCount: number;
  /** Redoスタックの件数 */
  redoCount: number;
};

/**
 * Undo/Redo履歴管理フック
 *
 * 使用例:
 * ```tsx
 * const { pushHistory, undo, redo, canUndo, canRedo } = useHistory();
 *
 * // アイテムを追加する前に現在の状態を保存
 * pushHistory();
 * addItem(newItem);
 * ```
 */
export const useHistory = (): UseHistoryResult => {
  const currentItems = useAtomValue(layoutItemsAtom);
  const historyState = useAtomValue(historyStateAtom);

  const pushHistoryAction = useSetAtom(pushHistoryAtom);
  const undoAction = useSetAtom(undoAtom);
  const redoAction = useSetAtom(redoAtom);
  const pushRedoStack = useSetAtom(pushRedoStackAtom);
  const pushUndoStack = useSetAtom(pushUndoStackAtom);
  const updateItems = useSetAtom(updateLayoutItemsAtom);

  /**
   * 現在の状態を履歴に追加
   */
  const pushHistory = useCallback(() => {
    pushHistoryAction(currentItems);
  }, [currentItems, pushHistoryAction]);

  /**
   * 一つ前の状態に戻す
   */
  const undo = useCallback(() => {
    // 現在の状態をRedoスタックに保存
    pushRedoStack(currentItems);

    // Undoを実行
    const previousState = undoAction();

    // 状態を復元
    if (previousState) {
      updateItems(previousState);
    }
  }, [currentItems, pushRedoStack, undoAction, updateItems]);

  /**
   * 元に戻した操作をやり直す
   */
  const redo = useCallback(() => {
    // 現在の状態をUndoスタックに保存
    pushUndoStack(currentItems);

    // Redoを実行
    const nextState = redoAction();

    // 状態を復元
    if (nextState) {
      updateItems(nextState);
    }
  }, [currentItems, pushUndoStack, redoAction, updateItems]);

  return {
    pushHistory,
    undo,
    redo,
    canUndo: historyState.canUndo,
    canRedo: historyState.canRedo,
    undoCount: historyState.undoCount,
    redoCount: historyState.redoCount,
  };
};
