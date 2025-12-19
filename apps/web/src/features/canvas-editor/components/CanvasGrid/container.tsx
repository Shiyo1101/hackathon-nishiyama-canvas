import type { GridConfig, LayoutItem } from "@/types";
import { CanvasGridPresentation } from "./presentation";

type CanvasGridContainerProps = {
  /** グリッド設定 */
  gridConfig: GridConfig;
  /** レイアウトアイテム */
  items: LayoutItem[];
  /** アイテム更新時のコールバック */
  onItemsChangeAction: (items: LayoutItem[]) => void;
  /** アイテム削除時のコールバック */
  onItemDeleteAction: (itemId: string) => void;
  /** アイテム編集時のコールバック */
  onItemEditAction: (itemId: string) => void;
  /** アイテム選択時のコールバック */
  onItemSelectAction: (itemId: string | null) => void;
  /** 選択中のアイテムID */
  selectedItemId: string | null;
};

export const CanvasGridContainer = (props: CanvasGridContainerProps): React.JSX.Element => {
  return <CanvasGridPresentation {...props} />;
};
