/**
 * ニュース選択コンポーネント - コンテナ
 *
 * ニュースデータを取得してプレゼンテーションコンポーネントに渡す
 *
 * NOTE: このコンポーネントはServer Componentでのみ使用できます。
 * イベントハンドラー（onDragStart, onDragEnd）を渡すことはできません。
 * イベントハンドラーが必要な場合は NewsSelectorClient を使用してください。
 */
import { NewsSelectorClient } from "./client";

type NewsSelectorContainerProps = {
  /** 取得するニュースの最大件数 */
  limit?: number;
  /** カテゴリフィルター */
  category?: string;
};

export const NewsSelectorContainer = ({
  limit = 20,
  category,
}: NewsSelectorContainerProps): React.JSX.Element => {
  // Server Componentではイベントハンドラーをpropsとして渡せないため、
  // クライアントコンポーネントを使用
  return <NewsSelectorClient limit={limit} category={category} />;
};
