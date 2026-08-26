"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  CalendarDays,
  Eye,
  EyeOff,
  MapPin,
  PlusCircle,
  Trash2,
} from "lucide-react";

import { deleteEvent, getMyEvents, updateEvent } from "@/lib/api/events";

import type { Event, EventStatus } from "@/types/event";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function OrganizerEvents() {
  const [events, setEvents] = useState<Event[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [processingId, setProcessingId] = useState<number | null>(null);

  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);

      const data = await getMyEvents();

      setEvents(data);
    } catch (error) {
      console.error(error);

      setError("Não foi possível carregar seus eventos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function changeStatus(event: Event, status: EventStatus) {
    try {
      setProcessingId(event.id);

      const updated = await updateEvent(event.id, {
        status,
      });

      setEvents((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (error) {
      console.error(error);

      setError("Não foi possível alterar o status do evento.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(event: Event) {
    const confirmed = window.confirm(
      `Deseja realmente excluir "${event.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(event.id);

      await deleteEvent(event.id);

      setEvents((current) => current.filter((item) => item.id !== event.id));
    } catch (error) {
      console.error(error);

      setError("Não foi possível excluir o evento.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <section className="w-full">
      {/* Cabeçalho */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Meus eventos</h1>

          <p className="mt-2 text-muted-foreground">
            Gerencie os eventos criados por você.
          </p>
        </div>

        <Link href="/organizador/event-create">
          <Button>
            <PlusCircle />
            Criar evento
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border p-10 text-center text-muted-foreground">
          Carregando eventos...
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="rounded-xl border p-10 text-center">
          <h2 className="text-xl font-semibold">Nenhum evento criado</h2>

          <p className="mt-2 text-muted-foreground">
            Crie seu primeiro evento para começar.
          </p>

          <Link href="/organizador/event-create">
            <Button className="mt-6">
              <PlusCircle />
              Criar evento
            </Button>
          </Link>
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="space-y-4">
          {events.map((event) => (
            <OrganizerEventCard
              key={event.id}
              event={event}
              processing={processingId === event.id}
              onStatusChange={changeStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

type OrganizerEventCardProps = {
  event: Event;
  processing: boolean;

  onStatusChange: (event: Event, status: EventStatus) => Promise<void>;

  onDelete: (event: Event) => Promise<void>;
};

function OrganizerEventCard({
  event,
  processing,
  onStatusChange,
  onDelete,
}: OrganizerEventCardProps) {
  const eventDate = new Date(event.event_date);

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(eventDate);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid md:grid-cols-[220px_1fr]">
          {/* Imagem */}
          <div className="relative min-h-[180px] overflow-hidden rounded-l-xl bg-muted">
            {event.image_url ? (
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                sizes="220px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[180px] items-center justify-center text-sm text-muted-foreground">
                Sem imagem
              </div>
            )}
          </div>

          {/* Conteúdo */}
          <div className="flex flex-col justify-between gap-6 p-6">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-primary">
                    {event.category}
                  </p>

                  <h2 className="mt-1 text-xl font-bold">{event.title}</h2>
                </div>

                <EventStatusBadge status={event.status} />
              </div>

              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} />

                  <span>{formattedDate}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={16} />

                  <span>{event.location}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground">Capacidade</p>

                  <p className="font-semibold">{event.capacity}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Inteira</p>

                  <p className="font-semibold">
                    R$ {Number(event.full_price).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">Meia</p>

                  <p className="font-semibold">
                    R$ {Number(event.half_price).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-wrap gap-2">
              {event.status === "PUBLISHED" ? (
                <Button
                  variant="outline"
                  disabled={processing}
                  onClick={() => onStatusChange(event, "DRAFT")}
                >
                  <EyeOff />
                  Tornar rascunho
                </Button>
              ) : (
                <Button
                  disabled={processing || event.status === "CANCELLED"}
                  onClick={() => onStatusChange(event, "PUBLISHED")}
                >
                  <Eye />
                  Publicar
                </Button>
              )}

              <Button
                variant="destructive"
                disabled={processing}
                onClick={() => onDelete(event)}
              >
                <Trash2 />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EventStatusBadge({ status }: { status: EventStatus }) {
  if (status === "PUBLISHED") {
    return <Badge>Publicado</Badge>;
  }

  if (status === "CANCELLED") {
    return <Badge variant="destructive">Cancelado</Badge>;
  }

  return <Badge variant="secondary">Rascunho</Badge>;
}
