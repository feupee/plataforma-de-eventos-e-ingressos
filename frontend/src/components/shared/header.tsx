"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, Search, Settings, TicketPlus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="flex h-20 w-full items-center border-b bg-background px-6">
      {/* Logo */}
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

      {/* Pesquisa */}
      <div className="flex flex-1 justify-center">
        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />

          <Input
            type="search"
            placeholder="Pesquisar eventos..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Tema + Usuário */}
      <div className="flex flex-1 items-center justify-end gap-3">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="rounded-full outline-none"
                aria-label="Abrir menu do usuário"
              />
            }
          >
            <Avatar className="cursor-pointer">
              <AvatarImage src="/usuario.png" alt="Usuário" />
              <AvatarFallback>FL</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Minha conta</DropdownMenuLabel>

              <DropdownMenuItem>
                <Settings />
                Configurações da conta
              </DropdownMenuItem>

              <Link href="/organizador">
                <DropdownMenuItem>
                  <TicketPlus />
                  Organizar evento
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive">
                <LogOut />
                Sair da conta
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
