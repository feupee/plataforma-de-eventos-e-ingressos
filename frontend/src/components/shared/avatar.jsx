import Link from "next/link";
import { LogOut, Settings, Ticket, TicketPlus } from "lucide-react";

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

export default function AvatarComponent() {
  return (
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

          <DropdownMenuItem render={<Link href="/cliente/configuracoes" />}>
            <Settings />
            Configurações da conta
          </DropdownMenuItem>

          <DropdownMenuItem render={<Link href="/organizador" />}>
            <TicketPlus />
            Organizar evento
          </DropdownMenuItem>

          <DropdownMenuItem render={<Link href="/cliente/ingressos" />}>
            <Ticket />
            Meus ingressos
          </DropdownMenuItem>
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
  );
}
