import type { Metadata } from "next";
import { CanvasEditorPanel } from "@/features/canvas-editor/components/CanvasEditorPanel";

export const metadata: Metadata = {
  title: "キャンバス編集 | にしやまきゃんばす！",
  description: "キャンバスのレイアウトを編集",
};

const CanvasEditPage = () => {
  return <CanvasEditorPanel />;
};

export default CanvasEditPage;
