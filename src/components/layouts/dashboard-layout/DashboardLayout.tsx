import { ReactNode } from "react";

import { AppSidebar } from "@/components/layouts/dashboard-layout/app-sidebar";
import { ColorThemeSwitcher } from "@/components/shared/ColorThemeSwitcher";
import { DensitySwitcher } from "@/components/shared/DensitySwitcher";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { MenuProvider } from "@/context/menu-context";
import { UserProvider } from "@/context/user-context";

import { BreadcrumbNavigation } from "./breadcrumb-navigation";
import NotificationPopover from "./Notification";

export interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <UserProvider>
      <MenuProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex justify-between h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator className="mr-2 h-4" orientation="vertical" />
                <BreadcrumbNavigation />
              </div>
              <div className="flex items-center gap-2 px-6">
                <ColorThemeSwitcher />
                <DensitySwitcher />
                <NotificationPopover />
              </div>
            </header>
            <div className="flex flex-1 border max-w-full overflow-x-hidden flex-col gap-4 p-4">
              {props.children}

              {/* <div className="grid auto-rows-min gap-4 border md:grid-cols-3">
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
            </div>
            <div className="min-h-[100vh] border flex-1 rounded-xl bg-muted/50 md:min-h-min" /> */}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </MenuProvider>
    </UserProvider>
  );
}
