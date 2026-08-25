"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { CalendarDays, CheckCircle2, MapPin, Minus, Plus } from "lucide-react";

import { useParams } from "next/navigation";

import { getEvent } from "@/lib/api/events";

import {
  createReservation,
  getEventAvailability,
} from "@/lib/api/reservations";

import type { Event } from "@/types/event";

import type {
  EventAvailability,
  Reservation as ReservationType,
} from "@/types/reservation";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { PaymentSimulation } from "@/components/cliente/payment-simulation";

export function Reservation() {
  const params = useParams<{
    id: string;
  }>();

  const eventId = Number(params.id);

  const [event, setEvent] = useState<Event | null>(null);

  const [availability, setAvailability] = useState<EventAvailability | null>(
    null,
  );

  const [reservation, setReservation] = useState<ReservationType | null>(null);

  const [fullQuantity, setFullQuantity] = useState(0);

  const [halfQuantity, setHalfQuantity] = useState(0);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [eventData, availabilityData] = await Promise.all([
          getEvent(eventId),
          getEventAvailability(eventId),
        ]);

        setEvent(eventData);

        setAvailability(availabilityData);
      } catch (error) {
        console.error(error);

        setError("Não foi possível carregar o evento.");
      } finally {
        setLoading(false);
      }
    }

    if (Number.isFinite(eventId)) {
      load();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Carregando reserva...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-4xl p-10 text-center">
        <h1 className="text-2xl font-bold">Não foi possível abrir a reserva</h1>

        <p className="mt-2 text-muted-foreground">{error}</p>

        <Link href="/cliente/eventos">
          <Button className="mt-6">Voltar aos eventos</Button>
        </Link>
      </div>
    );
  }

  const fullPrice = Number(event.full_price);

  const halfPrice = Number(event.half_price);

  const quantity = fullQuantity + halfQuantity;

  const total = fullQuantity * fullPrice + halfQuantity * halfPrice;

  async function handleReservation() {
    if (quantity <= 0) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const created = await createReservation({
        // Temporário até JWT.
        user_id: 2,

        event_id: eventId,

        full_quantity: fullQuantity,

        half_quantity: halfQuantity,
      });

      setReservation(created);

      const updatedAvailability = await getEventAvailability(eventId);

      setAvailability(updatedAvailability);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível realizar a reserva.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (reservation) {
    return (
      <div className="mx-auto w-full max-w-xl px-6 py-12">
        <Card>
          <CardContent className="flex flex-col items-center py-10 text-center">
            <CheckCircle2 size={64} className="text-green-600" />

            <h1 className="mt-5 text-2xl font-bold">Reserva realizada</h1>

            <p className="mt-2 text-muted-foreground">
              Seus ingressos foram reservados temporariamente.
            </p>

            <div className="mt-6 w-full rounded-xl bg-muted p-5 text-left">
              <div className="flex justify-between">
                <span>Reserva</span>

                <strong>#{reservation.id}</strong>
              </div>

              <div className="mt-2 flex justify-between">
                <span>Ingressos</span>

                <strong>
                  {reservation.full_quantity + reservation.half_quantity}
                </strong>
              </div>

              <div className="mt-2 flex justify-between">
                <span>Total</span>

                <strong>
                  R$ {Number(reservation.total_amount).toFixed(2)}
                </strong>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              A reserva fica disponível por aproximadamente 15 minutos enquanto
              o pagamento não é concluído.
            </p>

            <PaymentSimulation reservation={reservation} />

            <p className="mt-2 text-xs text-muted-foreground">
              O pagamento será conectado ao ambiente de testes do provedor na
              próxima etapa.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 p-6 lg:grid-cols-[1.3fr_1fr]">
      {/* Evento */}
      <div>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Evento sem imagem
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-primary">{event.category}</p>

          <h1 className="mt-1 text-3xl font-bold">{event.title}</h1>

          <div className="mt-4 flex flex-col gap-3 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} />

              <span>
                {new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "long",
                  timeStyle: "short",
                }).format(new Date(event.event_date))}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={18} />

              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ingressos */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Escolha seus ingressos</CardTitle>

          {availability && (
            <p className="text-sm text-muted-foreground">
              {availability.available} ingresso(s) disponível(is)
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Inteira */}
          <TicketQuantity
            title="Inteira"
            price={fullPrice}
            quantity={fullQuantity}
            disabled={availability ? quantity >= availability.available : false}
            onDecrease={() =>
              setFullQuantity((value) => Math.max(0, value - 1))
            }
            onIncrease={() => setFullQuantity((value) => value + 1)}
          />

          {/* Meia */}
          <TicketQuantity
            title="Meia-entrada"
            price={halfPrice}
            quantity={halfQuantity}
            disabled={availability ? quantity >= availability.available : false}
            onDecrease={() =>
              setHalfQuantity((value) => Math.max(0, value - 1))
            }
            onIncrease={() => setHalfQuantity((value) => value + 1)}
          />

          <div className="space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Ingressos</span>

              <span>{quantity}</span>
            </div>

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>

              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            className="h-12 w-full"
            disabled={quantity === 0 || submitting}
            onClick={handleReservation}
          >
            {submitting ? "Reservando..." : "Reservar ingressos"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

type TicketQuantityProps = {
  title: string;

  price: number;

  quantity: number;

  disabled: boolean;

  onDecrease: () => void;
  onIncrease: () => void;
};

function TicketQuantity({
  title,
  price,
  quantity,
  disabled,
  onDecrease,
  onIncrease,
}: TicketQuantityProps) {
  return (
    <div className="flex items-center justify-between border-b pb-5">
      <div>
        <p className="font-semibold">{title}</p>

        <p className="text-sm text-muted-foreground">R$ {price.toFixed(2)}</p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          disabled={quantity === 0}
          onClick={onDecrease}
        >
          <Minus />
        </Button>

        <span className="w-6 text-center font-semibold">{quantity}</span>

        <Button
          variant="outline"
          size="icon"
          disabled={disabled}
          onClick={onIncrease}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
}
