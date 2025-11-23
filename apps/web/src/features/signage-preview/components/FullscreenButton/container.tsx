/**
 * 全画面表示ボタン Containerコンポーネント
 *
 * データ取得とビジネスロジックを担当
 * （このコンポーネントはデータ取得がないため、単純なラッパー）
 */
import type { LayoutConfig } from "@/types";
import { FullscreenButtonPresentation } from "./presentation";

type FullscreenButtonContainerProps = {
  layoutConfig: LayoutConfig;
};

export const FullscreenButtonContainer = ({
  layoutConfig,
}: FullscreenButtonContainerProps): React.JSX.Element => {
  // このコンポーネントはデータ取得がないため、
  // Presentationコンポーネントに直接プロップスを渡す
  return <FullscreenButtonPresentation layoutConfig={layoutConfig} />;
};
