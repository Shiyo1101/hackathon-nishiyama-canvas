/**
 * キャンバスプレビューキャンバス Containerコンポーネント
 *
 * データ取得とビジネスロジックを担当
 * （このコンポーネントはデータ取得がないため、単純なラッパー）
 */
import type { LayoutConfig } from "@/types";
import { CanvasPreviewCanvasPresentation } from "./presentation";

type CanvasPreviewCanvasContainerProps = {
  layoutConfig: LayoutConfig;
};

export const CanvasPreviewCanvasContainer = ({
  layoutConfig,
}: CanvasPreviewCanvasContainerProps): React.JSX.Element => {
  // このコンポーネントはデータ取得がないため、
  // Presentationコンポーネントに直接プロップスを渡す
  return <CanvasPreviewCanvasPresentation layoutConfig={layoutConfig} />;
};
