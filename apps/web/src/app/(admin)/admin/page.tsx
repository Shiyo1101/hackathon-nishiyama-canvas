import { redirect } from "next/navigation";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { fetchCurrentUser } from "@/lib/fetcher";

const AdminDashboardPage = async (): Promise<React.JSX.Element> => {
  const me = await fetchCurrentUser();

  if (!me) {
    redirect("/login");
  }

  if (me.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex flex-1 items-center gap-2">
          <h1 className="font-semibold text-lg">管理画面ダッシュボード</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </SidebarInset>
  );
};

export default AdminDashboardPage;
