import type { LayoutConfig, Signage } from "@api/types";
import { atom } from "jotai";

// サイネージデータ
export const signageAtom = atom<Signage | null>(null);

// レイアウト設定
export const layoutConfigAtom = atom<LayoutConfig>({
  template_id: "default",
  background: { type: "color", color: "#fcf9f8" },
  grid: { columns: 2, rows: 2 },
  items: [],
});

// 選択中のアイテム
export const selectedItemAtom = atom<string | null>(null);

// 編集中かどうか
export const isEditingAtom = atom<boolean>(false);

// 保存中かどうか
export const isSavingAtom = atom<boolean>(false);

// エラーメッセージ
export const errorMessageAtom = atom<string | null>(null);
