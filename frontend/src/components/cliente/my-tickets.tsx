"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { TicketIcon } from "lucide-react";

import { getMyTickets } from "@/lib/api/tickets";

import type { Ticket } from "@/types/ticket";

import { TicketCard } from "@/components/cliente/ticket-card";

import { Button } from "@/components/ui/button";

export function MyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);

        setError(null);

        const data = await getMyTickets();

        setTickets(data);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar seus ingressos.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Carregando ingressos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 p-8 text-center">
        <h2 className="text-xl font-semibold">
          Não foi possível carregar seus ingressos
        </h2>

        <p className="mt-2 text-muted-foreground">{error}</p>

        <Link href="/login">
          <Button variant="outline" className="mt-6">
            Fazer login
          </Button>
        </Link>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border p-10 text-center">
        <TicketIcon size={48} className="text-muted-foreground" />

        <h2 className="mt-4 text-xl font-semibold">
          Você ainda não possui ingressos
        </h2>

        <p className="mt-2 text-muted-foreground">
          Os ingressos comprados nesta conta aparecerão aqui.
        </p>

        <Link href="/cliente/eventos">
          <Button className="mt-6">Encontrar eventos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
