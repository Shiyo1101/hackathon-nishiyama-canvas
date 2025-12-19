import { redirect } from "next/navigation";
import { fetchMyCanvas } from "@/features/canvas-editor/fetcher";
import { fetchCurrentUser } from "@/lib/fetcher";
import { CanvasEditorPanelPresentation } from "./presentation";

export const CanvasEditorPanelContainer = async (): Promise<React.JSX.Element> => {
  // 認証チェック
  const user = await fetchCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // バックエンドAPIからユーザーのキャンバスを取得
  let canvas = null;
  try {
    canvas = await fetchMyCanvas();
    if (!canvas) {
      console.log("No canvas found for current user - will create new one");
    }
  } catch (error) {
    console.error("Failed to fetch canvas:", error);
    // エラーが発生した場合も新規作成モードとする
  }

  return <CanvasEditorPanelPresentation initialCanvas={canvas} />;
};
