import { redirect } from "next/navigation";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AnimalsListContainer } from "@/features/admin/components/AnimalsList";
import { fetchCurrentUser } from "@/lib/fetcher";

const AdminAnimalsPage = async (): Promise<React.JSX.Element> => {
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
          <h1 className="font-semibold text-lg">動物情報管理</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <AnimalsListContainer />
      </div>
    </SidebarInset>
  );
};

export default AdminAnimalsPage;
