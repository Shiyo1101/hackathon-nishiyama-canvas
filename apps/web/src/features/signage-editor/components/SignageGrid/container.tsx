import type { GridConfig, LayoutItem } from "@/types";
import { SignageGridPresentation } from "./presentation";

type SignageGridContainerProps = {
  /** グリッド設定 */
  gridConfig: GridConfig;
  /** レイアウトアイテム */
  items: LayoutItem[];
  /** アイテム更新時のコールバック */
  onItemsChangeAction: (items: LayoutItem[]) => void;
  /** アイテム削除時のコールバック */
  onItemDeleteAction: (itemId: string) => void;
  /** アイテム選択時のコールバック */
  onItemSelectAction: (itemId: string | null) => void;
  /** 選択中のアイテムID */
  selectedItemId: string | null;
};

export const SignageGridContainer = (props: SignageGridContainerProps): React.JSX.Element => {
  // Container は Server Component だが、このコンポーネントは状態管理が必要なため
  // Presentation に処理を委譲する
  return <SignageGridPresentation {...props} />;
};
