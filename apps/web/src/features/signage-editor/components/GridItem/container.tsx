import type { LayoutItem } from "@/types";
import { GridItemPresentation } from "./presentation";

type GridItemContainerProps = {
  /** レイアウトアイテム */
  item: LayoutItem;
  /** 選択中かどうか */
  isSelected: boolean;
  /** ドラッグ中かどうか */
  isDragging: boolean;
  /** 削除ハンドラー */
  onDelete: () => void;
  /** 編集ハンドラー */
  onEdit: () => void;
  /** クリックハンドラー */
  onClick: () => void;
};

export const GridItemContainer = (props: GridItemContainerProps): React.JSX.Element => {
  return <GridItemPresentation {...props} />;
};
