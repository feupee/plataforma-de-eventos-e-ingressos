"use client";

import Image from "next/image";

import {
  CalendarDays,
  Check,
  Copy,
  MapPin,
  Share2,
  Ticket as TicketIcon,
} from "lucide-react";

import { useState } from "react";

import { QRCodeSVG } from "qrcode.react";

import type { Ticket } from "@/types/ticket";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TicketCardProps = {
  ticket: Ticket;
};

export function TicketCard({ ticket }: TicketCardProps) {
  const eventDate = new Date(ticket.event.event_date);

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(eventDate);

  const ticketType = ticket.ticket_type === "FULL" ? "Inteira" : "Meia-entrada";

  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl = `${window.location.origin}/ingresso/${ticket.code}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: ticket.event.title,
          text: `Ingresso para ${ticket.event.title}`,
          url: shareUrl,
        });

        return;
      }

      await navigator.clipboard.writeText(shareUrl);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Não foi possível compartilhar:", error);
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Imagem */}
      <div className="relative aspect-video w-full bg-muted">
        {ticket.event.image_url ? (
          <Image
            src={ticket.event.image_url}
            alt={ticket.event.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Evento sem imagem
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{ticket.event.title}</CardTitle>

            <div className="mt-2 flex items-center gap-2">
              <TicketIcon size={16} />

              <span className="text-sm text-muted-foreground">
                {ticketType}
              </span>
            </div>
          </div>

          <TicketStatusBadge status={ticket.status} />
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6 md:grid-cols-[1fr_auto]">
          {/* Informações */}
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <CalendarDays
                size={17}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />

              <span>{formattedDate}</span>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <MapPin
                size={17}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />

              <span>{ticket.event.location}</span>
            </div>

            <div className="pt-2">
              <p className="text-sm text-muted-foreground">Valor pago</p>

              <p className="text-lg font-bold">
                R$ {Number(ticket.price).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Ingresso #{ticket.id}
              </p>
            </div>
          </div>

          {/* QR */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-white p-4">
            <QRCodeSVG
              value={`ingressolivre:ticket:${ticket.code}`}
              size={140}
              level="M"
            />

            <p className="mt-3 max-w-[160px] truncate text-xs text-gray-500">
              {ticket.code}
            </p>
          </div>

          <Button
            variant="outline"
            className="mt-5 w-full"
            onClick={handleShare}
          >
            {copied ? (
              <>
                <Check />
                Link copiado
              </>
            ) : (
              <>
                <Share2 />
                Compartilhar ingresso
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TicketStatusBadge({ status }: { status: Ticket["status"] }) {
  if (status === "VALID") {
    return <Badge>Válido</Badge>;
  }

  if (status === "USED") {
    return <Badge variant="secondary">Utilizado</Badge>;
  }

  return <Badge variant="destructive">Cancelado</Badge>;
}
