import { redirect } from "next/navigation";
import type { ComponentProps } from "react";
import type { Sidebar } from "@/components/ui/sidebar";
import { fetchCurrentUser } from "@/lib/fetcher";
import { AppSidebarPresentation } from "./presentation";

type AppSidebarContainerProps = {
  props?: ComponentProps<typeof Sidebar>;
};

export const AppSidebarContainer = async ({
  props,
}: AppSidebarContainerProps): Promise<React.JSX.Element> => {
  const me = await fetchCurrentUser();

  if (!me) {
    redirect("/login");
  }

  return <AppSidebarPresentation user={me} props={props} />;
};
