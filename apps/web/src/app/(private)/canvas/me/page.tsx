import { SidebarProvider } from "@/components/ui/sidebar";
import { MyCanvasPanel } from "@/features/canvas/components/MyCanvasPanel";
import { AppSidebar } from "@/features/common/components/AppSidebar";

const MyCanvasPage = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <MyCanvasPanel />
    </SidebarProvider>
  );
};

export default MyCanvasPage;
