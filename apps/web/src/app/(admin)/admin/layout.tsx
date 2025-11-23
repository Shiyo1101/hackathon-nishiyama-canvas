import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/features/admin/components/AdminSidebar";

type AdminLayoutProps = {
  children: ReactNode;
};

const AdminLayout = ({ children }: AdminLayoutProps): React.JSX.Element => {
  return (
    <SidebarProvider>
      <AdminSidebar />
      {children}
    </SidebarProvider>
  );
};

export default AdminLayout;
