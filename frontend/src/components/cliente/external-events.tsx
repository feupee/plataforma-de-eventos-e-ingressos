"use client";

import { type FormEvent, useEffect, useState } from "react";

import {
  CalendarDays,
  ExternalLink,
  MapPin,
  Search,
  Ticket,
} from "lucide-react";

import { getExternalEvents } from "@/lib/api/external-events";

import type { ExternalEvent } from "@/types/external-event";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

export function ExternalEvents() {
  const [events, setEvents] = useState<ExternalEvent[]>([]);

  const [keyword, setKeyword] = useState("music");

  const [city, setCity] = useState("");

  const [countryCode, setCountryCode] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  async function loadEvents(
    searchKeyword = keyword,
    searchCity = city,
    searchCountry = countryCode,
  ) {
    try {
      setLoading(true);

      setError(null);

      const data = await getExternalEvents({
        keyword: searchKeyword.trim() || undefined,

        city: searchCity.trim() || undefined,

        countryCode: searchCountry.trim() || undefined,

        size: 12,
      });

      setEvents(data);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível consultar a Ticketmaster.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents("music", "", "");
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    loadEvents();
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-12">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold">Eventos pelo mundo</h2>

          <Badge variant="secondary">Ticketmaster</Badge>
        </div>

        <p className="mt-2 text-muted-foreground">
          Descubra eventos disponíveis através da Ticketmaster.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 grid gap-3 md:grid-cols-[1fr_220px_130px_auto]"
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
          onChange={(event) => setCountryCode(event.target.value.toUpperCase())}
          placeholder="País: US"
        />

        <Button type="submit" disabled={loading}>
          <Search />

          {loading ? "Buscando..." : "Buscar"}
        </Button>
      </form>

      {error && (
        <div className="mb-6 rounded-xl border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && (
        <div className="py-12 text-center text-muted-foreground">
          Consultando a Ticketmaster...
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="rounded-xl border p-10 text-center">
          <Ticket size={42} className="mx-auto text-muted-foreground" />

          <h3 className="mt-4 text-lg font-semibold">
            Nenhum evento encontrado
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Tente outro artista, cidade ou país.
          </p>
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event) => (
            <ExternalEventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}

function ExternalEventCard({ event }: { event: ExternalEvent }) {
  const formattedDate = formatEventDate(event.date);

  const location = [event.city, event.state, event.country]
    .filter(Boolean)
    .join(", ");

  return (
    <Card className="overflow-hidden p-0">
      <div
        className="aspect-video w-full bg-muted bg-cover bg-center"
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
            <Ticket size={36} />
          </div>
        )}
      </div>

      <CardContent className="flex h-full flex-col p-5">
        <div>
          {event.category && (
            <Badge variant="secondary" className="mb-3">
              {event.category}
            </Badge>
          )}

          <h3 className="line-clamp-2 text-lg font-semibold">{event.name}</h3>
        </div>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          {formattedDate && (
            <div className="flex items-start gap-2">
              <CalendarDays size={16} className="mt-0.5 shrink-0" />

              <span>
                {formattedDate}

                {event.time ? ` às ${event.time.slice(0, 5)}` : ""}
              </span>
            </div>
          )}

          {location && (
            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" />

              <span>
                {event.venue ? `${event.venue} — ${location}` : location}
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-5">
          {event.price_min !== null && (
            <p className="mb-3 font-semibold">
              A partir de {formatPrice(event.price_min, event.currency)}
            </p>
          )}

          {event.ticketmaster_url ? (
            <a
              href={event.ticketmaster_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="outline" className="w-full">
                Ver na Ticketmaster
                <ExternalLink />
              </Button>
            </a>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              Indisponível
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatEventDate(date: string | null) {
  if (!date) {
    return null;
  }

  const parsed = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
  }).format(parsed);
}

function formatPrice(price: number, currency: string | null) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",

      currency: currency ?? "USD",
    }).format(price);
  } catch {
    return `${currency ?? ""} ${price.toFixed(2)}`;
  }
}
