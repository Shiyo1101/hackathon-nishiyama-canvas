/**
 * サイネージエディターのバリデーションユーティリティ
 */
import type { GridConfig, LayoutItem } from "@/types";

/**
 * 2つの矩形が重なっているかチェック
 */
export const isOverlapping = (item1: LayoutItem, item2: LayoutItem): boolean => {
  const { position: pos1 } = item1;
  const { position: pos2 } = item2;

  // 矩形が重ならない条件:
  // - item1が item2の右側にある (pos1.x >= pos2.x + pos2.w)
  // - item1が item2の左側にある (pos1.x + pos1.w <= pos2.x)
  // - item1が item2の下側にある (pos1.y >= pos2.y + pos2.h)
  // - item1が item2の上側にある (pos1.y + pos1.h <= pos2.y)

  // 重ならない条件のいずれかが真なら重ならない
  const notOverlapping =
    pos1.x >= pos2.x + pos2.w ||
    pos1.x + pos1.w <= pos2.x ||
    pos1.y >= pos2.y + pos2.h ||
    pos1.y + pos1.h <= pos2.y;

  return !notOverlapping;
};

/**
 * アイテムがグリッドの範囲外にないかチェック
 */
export const isWithinGrid = (item: LayoutItem, grid: GridConfig): boolean => {
  const { position } = item;

  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x + position.w <= grid.columns &&
    position.y + position.h <= grid.rows
  );
};

/**
 * レイアウトアイテム配列の重複をチェック
 *
 * @returns 重複しているアイテムIDのペアの配列
 */
export const findOverlappingItems = (
  items: LayoutItem[],
): Array<{ item1Id: string; item2Id: string }> => {
  const overlaps: Array<{ item1Id: string; item2Id: string }> = [];

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (isOverlapping(items[i], items[j])) {
        overlaps.push({
          item1Id: items[i].id,
          item2Id: items[j].id,
        });
      }
    }
  }

  return overlaps;
};

/**
 * レイアウトアイテム配列のグリッド範囲外チェック
 *
 * @returns グリッド範囲外のアイテムIDの配列
 */
export const findOutOfBoundsItems = (items: LayoutItem[], grid: GridConfig): string[] => {
  return items.filter((item) => !isWithinGrid(item, grid)).map((item) => item.id);
};

/**
 * レイアウトの包括的なバリデーション
 */
export type ValidationResult = {
  isValid: boolean;
  errors: {
    overlapping: Array<{ item1Id: string; item2Id: string }>;
    outOfBounds: string[];
  };
};

export const validateLayout = (items: LayoutItem[], grid: GridConfig): ValidationResult => {
  const overlapping = findOverlappingItems(items);
  const outOfBounds = findOutOfBoundsItems(items, grid);

  return {
    isValid: overlapping.length === 0 && outOfBounds.length === 0,
    errors: {
      overlapping,
      outOfBounds,
    },
  };
};
