/**
 * サイネージプレビューキャンバス Containerコンポーネント
 *
 * データ取得とビジネスロジックを担当
 * （このコンポーネントはデータ取得がないため、単純なラッパー）
 */
import type { LayoutConfig } from "@/types";
import { SignagePreviewCanvasPresentation } from "./presentation";

type SignagePreviewCanvasContainerProps = {
  layoutConfig: LayoutConfig;
};

export const SignagePreviewCanvasContainer = ({
  layoutConfig,
}: SignagePreviewCanvasContainerProps): React.JSX.Element => {
  // このコンポーネントはデータ取得がないため、
  // Presentationコンポーネントに直接プロップスを渡す
  return <SignagePreviewCanvasPresentation layoutConfig={layoutConfig} />;
};
