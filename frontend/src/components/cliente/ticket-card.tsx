"use client";

import Image from "next/image";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TicketCardProps = {
  eventName: string;
  date: string;
  time: string;
  location: string;
  ticketType: string;
  price: number;
  image: string;
  code: string;
  status: string;
};

export function TicketCard({
  eventName,
  date,
  time,
  location,
  ticketType,
  price,
  image,
  code,
  status,
}: TicketCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Imagem */}
      <div className="relative aspect-video w-full">
        <Image
          src={image}
          alt={eventName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{eventName}</CardTitle>

            <div className="mt-2 flex items-center gap-2">
              <Ticket size={16} />

              <span className="text-sm text-muted-foreground">
                {ticketType}
              </span>
            </div>
          </div>

          <Badge variant="secondary">
            {status === "VALID" ? "Válido" : "Utilizado"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6 md:grid-cols-[1fr_auto]">
          {/* Informações */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays size={17} className="text-muted-foreground" />

              <span>
                {date} às {time}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <MapPin size={17} className="text-muted-foreground" />

              <span>{location}</span>
            </div>

            <div className="pt-2">
              <p className="text-sm text-muted-foreground">Valor pago</p>

              <p className="text-lg font-bold">R$ {price.toFixed(2)}</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-white p-4">
            <QRCodeSVG
              value={`ingressolivre:ticket:${code}`}
              size={130}
              level="M"
            />

            <p className="mt-3 max-w-[150px] truncate text-xs text-gray-500">
              {code}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
