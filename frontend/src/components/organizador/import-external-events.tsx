"use client";

import { type FormEvent, useState } from "react";

import { CalendarDays, MapPin, Search, Ticket } from "lucide-react";

import { useRouter } from "next/navigation";

import { getExternalEvents } from "@/lib/api/external-events";

import { saveImportedEvent } from "@/lib/imported-event";

import type { ExternalEvent } from "@/types/external-event";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

export function ImportExternalEvents() {
  const router = useRouter();

  const [events, setEvents] = useState<ExternalEvent[]>([]);

  const [keyword, setKeyword] = useState("");

  const [city, setCity] = useState("");

  const [countryCode, setCountryCode] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);

      setError(null);

      const data = await getExternalEvents({
        keyword: keyword.trim() || undefined,

        city: city.trim() || undefined,

        countryCode: countryCode.trim() || undefined,

        size: 12,
      });

      setEvents(data);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível consultar " + "a Ticketmaster.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleImport(event: ExternalEvent) {
    saveImportedEvent(event);

    router.push("/organizador/event-create?imported=1");
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Importar evento</h1>

          <Badge variant="secondary">Ticketmaster</Badge>
        </div>

        <p className="mt-2 text-muted-foreground">
          Pesquise um evento na Ticketmaster e utilize suas informações como
          base para criar um evento no IngressoLivre.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form
            onSubmit={handleSearch}
            className="grid gap-3 md:grid-cols-[1fr_220px_130px_auto]"
          >
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Artista, evento ou categoria"
            />

            <Input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Cidade"
            />

            <Input
              value={countryCode}
              maxLength={2}
              onChange={(event) =>
                setCountryCode(event.target.value.toUpperCase())
              }
              placeholder="País: BR"
            />

            <Button type="submit" disabled={loading}>
              <Search />

              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Ticket size={44} className="mx-auto text-muted-foreground" />

          <h2 className="mt-4 text-lg font-semibold">Pesquise um evento</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Os resultados da Ticketmaster aparecerão aqui.
          </p>
        </div>
      )}

      {events.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <ExternalEventCard
              key={event.id}
              event={event}
              onImport={() => handleImport(event)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ExternalEventCard({
  event,
  onImport,
}: {
  event: ExternalEvent;
  onImport: () => void;
}) {
  const location = [event.venue, event.city, event.state, event.country]
    .filter(Boolean)
    .join(" - ");

  return (
    <Card className="overflow-hidden p-0">
      <div
        className="aspect-video bg-muted bg-cover bg-center"
        style={
          event.image_url
            ? {
                backgroundImage: `url("${event.image_url}")`,
              }
            : undefined
        }
      >
        {!event.image_url && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Ticket size={40} />
          </div>
        )}
      </div>

      <CardContent className="flex h-full flex-col p-5">
        {event.category && (
          <Badge variant="secondary" className="mb-3 w-fit">
            {event.category}
          </Badge>
        )}

        <h2 className="text-lg font-semibold">{event.name}</h2>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          {event.date && (
            <div className="flex items-center gap-2">
              <CalendarDays size={16} />

              <span>
                {formatDate(event.date)}

                {event.time ? ` às ${event.time.slice(0, 5)}` : ""}
              </span>
            </div>
          )}

          {location && (
            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" />

              <span>{location}</span>
            </div>
          )}
        </div>

        <Button className="mt-6 w-full" onClick={onImport}>
          Importar evento
        </Button>
      </CardContent>
    </Card>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
  }).format(new Date(`${date}T12:00:00`));
}
