import type { CanvasTemplate } from "@/types";
import { TemplateSelectorPresentation } from "./presentation";

type TemplateSelectorContainerProps = {
  /** テンプレート一覧 */
  templates: CanvasTemplate[];
  /** テンプレート選択時のコールバック */
  onSelectTemplate: (template: CanvasTemplate) => void;
  /** 選択中のテンプレートID */
  selectedTemplateId?: string;
};

export const TemplateSelectorContainer = (
  props: TemplateSelectorContainerProps,
): React.JSX.Element => {
  return <TemplateSelectorPresentation {...props} />;
};
