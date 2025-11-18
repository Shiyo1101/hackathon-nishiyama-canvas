/**
 * ドラッグ&ドロップ用のAtom定義
 */
import { atom } from "jotai";
import type { ContentItemType } from "@/types";

/**
 * ドラッグ中のアイテムタイプ
 */
export const draggingItemTypeAtom = atom<ContentItemType | null>(null);
