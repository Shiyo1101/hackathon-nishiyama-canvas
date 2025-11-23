import { redirect } from "next/navigation";
import type { ComponentProps } from "react";
import type { Sidebar } from "@/components/ui/sidebar";
import { fetchCurrentUser } from "@/lib/fetcher";
import { AdminSidebarPresentation } from "./presentation";

type AdminSidebarContainerProps = {
  props?: ComponentProps<typeof Sidebar>;
};

export const AdminSidebarContainer = async ({
  props,
}: AdminSidebarContainerProps): Promise<React.JSX.Element> => {
  const me = await fetchCurrentUser();

  // 認証チェック
  if (!me) {
    redirect("/login");
  }

  // 管理者権限チェック
  if (me.role !== "admin") {
    redirect("/dashboard");
  }

  return <AdminSidebarPresentation user={me} props={props} />;
};
