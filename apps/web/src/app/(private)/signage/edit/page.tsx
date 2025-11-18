import type { Metadata } from "next";
import { SignageEditorPanel } from "@/features/signage-editor/components/SignageEditorPanel";

export const metadata: Metadata = {
  title: "サイネージ編集 | にしやまきゃんばす！",
  description: "サイネージのレイアウトを編集",
};

const SignageEditPage = () => {
  return <SignageEditorPanel />;
};

export default SignageEditPage;
