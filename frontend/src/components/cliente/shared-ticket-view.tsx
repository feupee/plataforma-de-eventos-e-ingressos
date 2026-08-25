"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { CalendarDays, MapPin, Ticket as TicketIcon } from "lucide-react";

import { useParams } from "next/navigation";

import { QRCodeSVG } from "qrcode.react";

import { getSharedTicket } from "@/lib/api/tickets";

import type { SharedTicket } from "@/types/ticket";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SharedTicketView() {
  const params = useParams<{
    code: string;
  }>();

  const code = params.code;

  const [ticket, setTicket] = useState<SharedTicket | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTicket() {
      try {
        setLoading(true);

        const data = await getSharedTicket(code);

        setTicket(data);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o ingresso.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (code) {
      loadTicket();
    }
  }, [code]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-muted-foreground">Carregando ingresso...</p>
      </main>
    );
  }

  if (error || !ticket) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="py-10 text-center">
            <h1 className="text-2xl font-bold">Ingresso não encontrado</h1>

            <p className="mt-2 text-muted-foreground">{error}</p>

            <Link href="/">
              <Button variant="outline" className="mt-6">
                Ir para o IngressoLivre
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const eventDate = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(ticket.event.event_date));

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-10">
      <Card className="w-full max-w-xl overflow-hidden">
        <div className="relative aspect-video bg-muted">
          {ticket.event.image_url ? (
            <Image
              src={ticket.event.image_url}
              alt={ticket.event.title}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Evento sem imagem
            </div>
          )}
        </div>

        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">IngressoLivre</p>

              <CardTitle className="mt-1 text-2xl">
                {ticket.event.title}
              </CardTitle>
            </div>

            <StatusBadge status={ticket.status} />
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-muted-foreground" />

              <span>{eventDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-muted-foreground" />

              <span>{ticket.event.location}</span>
            </div>

            <div className="flex items-center gap-2">
              <TicketIcon size={18} className="text-muted-foreground" />

              <span>
                {ticket.ticket_type === "FULL" ? "Inteira" : "Meia-entrada"}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center rounded-xl border bg-white p-6">
            <QRCodeSVG
              value={`ingressolivre:ticket:${ticket.code}`}
              size={200}
              level="M"
            />

            <p className="mt-4 text-center text-xs text-gray-500">
              Apresente este QR Code na entrada do evento.
            </p>
          </div>

          {ticket.status === "USED" && (
            <div className="mt-5 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-center text-sm">
              Este ingresso já foi utilizado.
            </div>
          )}

          {ticket.status === "CANCELLED" && (
            <div className="mt-5 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-center text-sm">
              Este ingresso foi cancelado.
            </div>
          )}

          <Link href="/">
            <Button variant="outline" className="mt-6 w-full">
              Conhecer o IngressoLivre
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}

function StatusBadge({ status }: { status: "VALID" | "USED" | "CANCELLED" }) {
  if (status === "VALID") {
    return <Badge>Válido</Badge>;
  }

  if (status === "USED") {
    return <Badge variant="secondary">Utilizado</Badge>;
  }

  return <Badge variant="destructive">Cancelado</Badge>;
}
