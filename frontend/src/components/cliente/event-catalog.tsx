"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, MapPin, Search } from "lucide-react";

import { getEvents } from "@/lib/api/events";
import type { Event } from "@/types/event";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EventCatalog() {
  const searchParams = useSearchParams();

  const busca = searchParams.get("busca") ?? "";
  const categoria = searchParams.get("categoria") ?? "";

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);

        const data = await getEvents({
          search: busca || undefined,
          category: categoria || undefined,

          // Cliente só deve visualizar eventos publicados.
          status: "PUBLISHED",
        });

        if (active) {
          setEvents(data);
        }
      } catch (error) {
        console.error(error);

        if (active) {
          setError("Não foi possível carregar os eventos.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      active = false;
    };
  }, [busca, categoria]);

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-8">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Eventos</h1>

        <p className="mt-2 text-muted-foreground">
          Encontre shows, festivais, tecnologia, gastronomia e outras
          experiências.
        </p>
      </div>

      {/* Pesquisa */}
      <form action="/cliente/eventos" className="mb-8 flex max-w-2xl gap-2">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />

          <Input
            type="search"
            name="busca"
            defaultValue={busca}
            placeholder="Pesquisar evento, categoria ou local..."
            className="pl-10"
          />
        </div>

        <Button type="submit">Buscar</Button>
      </form>

      {/* Categoria selecionada */}
      {categoria && (
        <div className="mb-6 flex items-center gap-3">
          <p className="text-sm text-muted-foreground">Categoria:</p>

          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {categoria}
          </span>

          <Link
            href="/cliente/eventos"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Limpar filtro
          </Link>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border p-10 text-center">
          <p className="text-muted-foreground">Carregando eventos...</p>
        </div>
      )}

      {/* Erro */}
      {!loading && error && (
        <div className="rounded-xl border border-destructive/50 p-10 text-center">
          <h2 className="text-xl font-semibold">Erro ao carregar eventos</h2>

          <p className="mt-2 text-muted-foreground">{error}</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Verifique se o backend está sendo executado.
          </p>
        </div>
      )}

      {/* Sem eventos */}
      {!loading && !error && events.length === 0 && (
        <div className="rounded-xl border p-10 text-center">
          <h2 className="text-xl font-semibold">Nenhum evento encontrado</h2>

          <p className="mt-2 text-muted-foreground">
            Tente pesquisar outro nome, categoria ou local.
          </p>
        </div>
      )}

      {/* Eventos */}
      {!loading && !error && events.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}

type EventCardProps = {
  event: Event;
};

function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.event_date);

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(eventDate);

  const formattedTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(eventDate);

  const fullPrice = Number(event.full_price);
  const halfPrice = Number(event.half_price);

  return (
    <Link href={`/cliente/eventos/${event.id}/reserva`} className="group">
      <article className="h-full overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary">
        {/* Imagem */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Evento sem imagem
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="p-4">
          <p className="text-sm font-medium text-primary">{event.category}</p>

          <h2 className="mt-1 line-clamp-2 text-lg font-semibold">
            {event.title}
          </h2>

          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <CalendarDays size={16} className="mt-0.5 shrink-0" />

              <span>
                {formattedDate} às {formattedTime}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" />

              <span>{event.location}</span>
            </div>
          </div>

          {/* Preços */}
          <div className="mt-5 border-t pt-4">
            <p className="text-xs text-muted-foreground">Ingressos</p>

            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <p className="font-semibold">Inteira R$ {fullPrice.toFixed(2)}</p>

              <p className="text-sm text-muted-foreground">
                Meia R$ {halfPrice.toFixed(2)}
              </p>
            </div>

            <p className="mt-3 text-sm font-medium text-primary">
              Ver ingressos
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
