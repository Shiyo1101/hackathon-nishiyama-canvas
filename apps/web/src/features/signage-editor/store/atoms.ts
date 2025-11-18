/**
 * サイネージエディターの状態管理 (Jotai Atoms)
 */
import { atom } from "jotai";
import type { LayoutConfig, LayoutItem } from "@/types";

/**
 * 現在のレイアウト設定
 */
export const layoutConfigAtom = atom<LayoutConfig | null>(null);

/**
 * 選択中のアイテムID
 */
export const selectedItemIdAtom = atom<string | null>(null);

/**
 * 編集中のサイネージID
 */
export const signageIdAtom = atom<string | null>(null);

/**
 * サイネージのタイトル
 */
export const signageTitleAtom = atom<string>("");

/**
 * サイネージの説明
 */
export const signageDescriptionAtom = atom<string | null>(null);

/**
 * サイネージの公開状態
 */
export const isPublicAtom = atom<boolean>(false);

/**
 * サイネージのスラッグ
 */
export const signageSlugAtom = atom<string>("");

/**
 * 保存中フラグ
 */
export const isSavingAtom = atom<boolean>(false);

/**
 * エラーメッセージ
 */
export const errorMessageAtom = atom<string | null>(null);

/**
 * レイアウトアイテムの読み取り専用Atom
 */
export const layoutItemsAtom = atom<LayoutItem[]>((get) => {
  const layout = get(layoutConfigAtom);
  return layout?.items ?? [];
});

/**
 * レイアウトアイテムを更新する書き込み専用Atom
 */
export const updateLayoutItemsAtom = atom(null, (get, set, items: LayoutItem[]) => {
  const currentLayout = get(layoutConfigAtom);
  if (currentLayout) {
    set(layoutConfigAtom, {
      ...currentLayout,
      items,
    });
  }
});

/**
 * アイテムを追加する書き込み専用Atom
 */
export const addLayoutItemAtom = atom(null, (get, set, item: LayoutItem) => {
  const currentItems = get(layoutItemsAtom);
  set(updateLayoutItemsAtom, [...currentItems, item]);
});

/**
 * アイテムを削除する書き込み専用Atom
 */
export const removeLayoutItemAtom = atom(null, (get, set, itemId: string) => {
  const currentItems = get(layoutItemsAtom);
  set(
    updateLayoutItemsAtom,
    currentItems.filter((item) => item.id !== itemId),
  );

  const selectedId = get(selectedItemIdAtom);
  if (selectedId === itemId) {
    set(selectedItemIdAtom, null);
  }
});

/**
 * アイテムを更新する書き込み専用Atom
 */
export const updateLayoutItemAtom = atom(null, (get, set, updatedItem: LayoutItem) => {
  const currentItems = get(layoutItemsAtom);
  set(
    updateLayoutItemsAtom,
    currentItems.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
  );
});

/**
 * 選択中のアイテムを取得する派生Atom
 */
export const selectedItemAtom = atom<LayoutItem | null>((get) => {
  const selectedId = get(selectedItemIdAtom);
  const items = get(layoutItemsAtom);
  return items.find((item) => item.id === selectedId) ?? null;
});
