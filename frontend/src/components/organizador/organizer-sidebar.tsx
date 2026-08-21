"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  CalendarDays,
  CircleDollarSign,
  House,
  PlusCircle,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Início",
    href: "/organizador",
    icon: House,
  },
  {
    title: "Meus eventos",
    href: "/organizador/events",
    icon: CalendarDays,
  },
  {
    title: "Criar evento",
    href: "/organizador/event-create",
    icon: PlusCircle,
  },
  {
    title: "Financeiro",
    href: "/organizador/financial",
    icon: CircleDollarSign,
  },
];

export function OrganizerSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-5">
        <div className="flex flex-1 items-center">
          <Link href="/cliente">
            <Image
              src="/logo-ingressolivre.png"
              alt="IngressoLivre"
              width={180}
              height={45}
              priority
              className="cursor-pointer"
            />
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gerenciamento</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Icon size={18} />
                      {item.title}
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
