import { OrganizerSidebar } from "@/components/organizador/organizer-sidebar";
import AvatarComponent from "@/components/shared/avatar";
import { ThemeToggle } from "@/components/shared/theme-toggle";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function OrganizadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <OrganizerSidebar />

      <SidebarInset>
        <header className="flex h-16 w-full items-center border-b px-6">
          <SidebarTrigger />
          <p className="text-sm text-muted-foreground">Painel do organizador</p>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <AvatarComponent />
          </div>
        </header>
        <main className="p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
