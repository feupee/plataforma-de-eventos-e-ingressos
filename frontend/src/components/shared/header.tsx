"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import { ThemeToggle } from "./theme-toggle";
import AvatarComponent from "../shared/avatar";

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

        <AvatarComponent />
      </div>
    </header>
  );
}
