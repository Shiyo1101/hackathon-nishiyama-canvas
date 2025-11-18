import { redirect } from "next/navigation";
import { fetchMySignage } from "@/features/signage-editor/fetcher";
import { fetchCurrentUser } from "@/lib/fetcher";
import { SignageEditorPanelPresentation } from "./presentation";

export const SignageEditorPanelContainer = async (): Promise<React.JSX.Element> => {
  // 認証チェック
  const user = await fetchCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // バックエンドAPIからユーザーのサイネージを取得
  let signage = null;
  try {
    signage = await fetchMySignage();
    if (!signage) {
      console.log("No signage found for current user - will create new one");
    }
  } catch (error) {
    console.error("Failed to fetch signage:", error);
    // エラーが発生した場合も新規作成モードとする
  }

  return <SignageEditorPanelPresentation initialSignage={signage} />;
};
