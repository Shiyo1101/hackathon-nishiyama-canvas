import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/common/components/AppSidebar";
import { MySignagePanel } from "@/features/signage/components/MySignagePanel";

const MySignagePage = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <MySignagePanel />
    </SidebarProvider>
  );
};

export default MySignagePage;
