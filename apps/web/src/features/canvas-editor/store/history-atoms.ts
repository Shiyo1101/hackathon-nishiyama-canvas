/**
 * Undo/Redo履歴管理のためのJotai Atoms
 */
import { atom } from "jotai";
import type { LayoutItem } from "@/types";

/**
 * 履歴エントリーの型定義
 */
export type HistoryEntry = {
  items: LayoutItem[];
  timestamp: number;
};

/**
 * Undo用の履歴スタック
 * 最大50履歴まで保持
 */
export const undoStackAtom = atom<HistoryEntry[]>([]);

/**
 * Redo用の履歴スタック
 */
export const redoStackAtom = atom<HistoryEntry[]>([]);

/**
 * 現在の履歴状態を取得する派生Atom
 */
export const historyStateAtom = atom((get) => {
  const undoStack = get(undoStackAtom);
  const redoStack = get(redoStackAtom);

  return {
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    undoCount: undoStack.length,
    redoCount: redoStack.length,
  };
});

/**
 * 履歴の最大保持数
 */
const MAX_HISTORY_SIZE = 50;

/**
 * 履歴に現在の状態を追加する書き込み専用Atom
 */
export const pushHistoryAtom = atom(null, (get, set, items: LayoutItem[]) => {
  const undoStack = get(undoStackAtom);

  // 新しい履歴エントリーを作成
  const newEntry: HistoryEntry = {
    items: JSON.parse(JSON.stringify(items)), // Deep copy
    timestamp: Date.now(),
  };

  // 履歴スタックに追加（最大数を超えたら古いものを削除）
  const newStack = [...undoStack, newEntry];
  if (newStack.length > MAX_HISTORY_SIZE) {
    newStack.shift(); // 最も古い履歴を削除
  }

  set(undoStackAtom, newStack);

  // 新しい操作を行ったらRedoスタックはクリア
  set(redoStackAtom, []);
});

/**
 * Undoを実行する書き込み専用Atom
 *
 * @returns Undoした後の状態（items）、またはnull（Undo不可能な場合）
 */
export const undoAtom = atom(null, (get, set): LayoutItem[] | null => {
  const undoStack = get(undoStackAtom);

  if (undoStack.length === 0) {
    return null; // Undo不可能
  }

  // Undoスタックから最後の状態を取り出す
  const newUndoStack = [...undoStack];
  const previousState = newUndoStack.pop();

  if (!previousState) {
    return null;
  }

  // 現在の状態をRedoスタックに追加
  // Note: 現在の状態は呼び出し元が提供する必要がある
  set(undoStackAtom, newUndoStack);

  return previousState.items;
});

/**
 * Redoを実行する書き込み専用Atom
 *
 * @returns Redoした後の状態（items）、またはnull（Redo不可能な場合）
 */
export const redoAtom = atom(null, (get, set): LayoutItem[] | null => {
  const redoStack = get(redoStackAtom);

  if (redoStack.length === 0) {
    return null; // Redo不可能
  }

  // Redoスタックから最後の状態を取り出す
  const newRedoStack = [...redoStack];
  const nextState = newRedoStack.pop();

  if (!nextState) {
    return null;
  }

  set(redoStackAtom, newRedoStack);

  return nextState.items;
});

/**
 * 履歴をリセットする書き込み専用Atom
 */
export const clearHistoryAtom = atom(null, (_get, set) => {
  set(undoStackAtom, []);
  set(redoStackAtom, []);
});

/**
 * 現在の状態をRedoスタックに追加する書き込み専用Atom
 * Undoを実行する直前に呼ばれる
 */
export const pushRedoStackAtom = atom(null, (get, set, items: LayoutItem[]) => {
  const redoStack = get(redoStackAtom);

  const newEntry: HistoryEntry = {
    items: JSON.parse(JSON.stringify(items)), // Deep copy
    timestamp: Date.now(),
  };

  const newStack = [...redoStack, newEntry];
  if (newStack.length > MAX_HISTORY_SIZE) {
    newStack.shift();
  }

  set(redoStackAtom, newStack);
});

/**
 * Undoスタックに状態を追加する書き込み専用Atom
 * Redoを実行する直前に呼ばれる
 */
export const pushUndoStackAtom = atom(null, (get, set, items: LayoutItem[]) => {
  const undoStack = get(undoStackAtom);

  const newEntry: HistoryEntry = {
    items: JSON.parse(JSON.stringify(items)), // Deep copy
    timestamp: Date.now(),
  };

  const newStack = [...undoStack, newEntry];
  if (newStack.length > MAX_HISTORY_SIZE) {
    newStack.shift();
  }

  set(undoStackAtom, newStack);
});
