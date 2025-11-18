import type { ReactNode } from "react";
import { SidebarInset } from "../ui/sidebar";

type SidebarMainProps = {
  children: ReactNode;
};

export const SidebarMain = ({ children }: SidebarMainProps) => {
  return (
    <main className="flex flex-1 p-4">
      <SidebarInset className="h-full">{children}</SidebarInset>
    </main>
  );
};
