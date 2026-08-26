import { RoleGuard } from "@/components/auth/role-guard";

import { OrganizerSidebar } from "@/components/organizador/organizer-sidebar";

import { ThemeToggle } from "@/components/shared/theme-toggle";

import { Separator } from "@/components/ui/separator";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function OrganizerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RoleGuard allowedRoles={["ORGANIZER"]}>
      <SidebarProvider>
        <OrganizerSidebar />

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />

              <Separator orientation="vertical" className="h-4" />
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  );
}
