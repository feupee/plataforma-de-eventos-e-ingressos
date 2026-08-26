"use client";

import Link from "next/link";

import { LogOut, Settings, Ticket, TicketPlus, User } from "lucide-react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserAvatar() {
  const router = useRouter();

  const { user, loading, signOut } = useAuth();

  function handleLogout() {
    signOut();

    router.push("/login");
  }

  if (loading) {
    return (
      <Avatar>
        <AvatarFallback>...</AvatarFallback>
      </Avatar>
    );
  }

  if (!user) {
    return (
      <Link href="/login">
        <Avatar className="cursor-pointer">
          <AvatarFallback>
            <User size={18} />
          </AvatarFallback>
        </Avatar>
      </Link>
    );
  }

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="rounded-full"
            aria-label="Abrir menu do usuário"
          />
        }
      >
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{user.name}</span>

              <span className="text-xs font-normal text-muted-foreground">
                {user.email}
              </span>

              <span className="mt-1 text-xs font-normal text-muted-foreground">
                {getRoleName(user.role)}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {user.role === "CLIENT" && (
            <>
              <DropdownMenuItem render={<Link href="/cliente/configuracoes" />}>
                <Settings />
                Configurações da conta
              </DropdownMenuItem>

              <DropdownMenuItem render={<Link href="/cliente/ingressos" />}>
                <Ticket />
                Meus ingressos
              </DropdownMenuItem>
            </>
          )}

          {user.role === "ORGANIZER" && (
            <DropdownMenuItem render={<Link href="/organizador" />}>
              <TicketPlus />
              Painel do organizador
            </DropdownMenuItem>
          )}

          {user.role === "GATE" && (
            <DropdownMenuItem render={<Link href="/portaria" />}>
              <Ticket />
              Portaria
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={handleLogout}>
            <LogOut />
            Sair da conta
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getRoleName(role: "CLIENT" | "ORGANIZER" | "GATE") {
  if (role === "ORGANIZER") {
    return "Organizador";
  }

  if (role === "GATE") {
    return "Portaria";
  }

  return "Cliente";
}
