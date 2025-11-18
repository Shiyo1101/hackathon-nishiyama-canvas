import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { FavoriteSignageList } from "../FavoriteSignageList";
import { PopularSignageList } from "../PopularSignageList";
import { SignageCanvas } from "../SignageCanvas";

export const MySignagePanelPresentation = () => {
  return (
    <SidebarInset className="h-full">
      <header className="flex h-12 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1 h-8 w-8" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">ダッシュボード</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block">🐾</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>マイサイネージ</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <SignageCanvas />
        <FavoriteSignageList limit={5} />
        <PopularSignageList limit={5} />
      </main>
    </SidebarInset>
  );
};
