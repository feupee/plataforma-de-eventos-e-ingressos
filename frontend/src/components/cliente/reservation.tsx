"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarDays, MapPin, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Reservation() {
  const [inteira, setInteira] = useState(0);
  const [meia, setMeia] = useState(0);

  const precoInteira = 100;
  const precoMeia = 50;

  const quantidade = inteira + meia;

  const total = inteira * precoInteira + meia * precoMeia;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 p-6 lg:grid-cols-[1.3fr_1fr]">
      {/* Evento */}
      <div>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src="/carousel/evento1.png"
            alt="Festival de Música 2026"
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-primary">Música</p>

          <h1 className="mt-1 text-3xl font-bold">Festival de Música 2026</h1>

          <div className="mt-4 flex flex-col gap-3 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} />

              <span>12 de Setembro de 2026 às 20:00</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={18} />

              <span>Uberlândia - MG</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reserva */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Escolha seus ingressos</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Inteira */}
          <div className="flex items-center justify-between border-b pb-5">
            <div>
              <p className="font-semibold">Inteira</p>

              <p className="text-sm text-muted-foreground">
                R$ {precoInteira.toFixed(2)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setInteira((valor) => Math.max(0, valor - 1))}
              >
                <Minus />
              </Button>

              <span className="w-6 text-center font-semibold">{inteira}</span>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setInteira((valor) => valor + 1)}
              >
                <Plus />
              </Button>
            </div>
          </div>

          {/* Meia */}
          <div className="flex items-center justify-between border-b pb-5">
            <div>
              <p className="font-semibold">Meia-entrada</p>

              <p className="text-sm text-muted-foreground">
                R$ {precoMeia.toFixed(2)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMeia((valor) => Math.max(0, valor - 1))}
              >
                <Minus />
              </Button>

              <span className="w-6 text-center font-semibold">{meia}</span>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setMeia((valor) => valor + 1)}
              >
                <Plus />
              </Button>
            </div>
          </div>

          {/* Resumo */}
          <div className="space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Ingressos</span>
              <span>{quantidade}</span>
            </div>

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>

              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <Button className="h-12 w-full text-base" disabled={quantidade === 0}>
            Continuar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
