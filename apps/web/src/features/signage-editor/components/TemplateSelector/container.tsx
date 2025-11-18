import type { SignageTemplate } from "@/types";
import { TemplateSelectorPresentation } from "./presentation";

type TemplateSelectorContainerProps = {
  /** テンプレート一覧 */
  templates: SignageTemplate[];
  /** テンプレート選択時のコールバック */
  onSelectTemplate: (template: SignageTemplate) => void;
  /** 選択中のテンプレートID */
  selectedTemplateId?: string;
};

export const TemplateSelectorContainer = (
  props: TemplateSelectorContainerProps,
): React.JSX.Element => {
  return <TemplateSelectorPresentation {...props} />;
};
