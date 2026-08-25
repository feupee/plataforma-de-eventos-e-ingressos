"use client";

import { useEffect, useState } from "react";

import { EventCarousel } from "@/components/cliente/event-carousel";
import { EventCategories } from "@/components/cliente/event-categories";
import { EventListCarousel } from "@/components/cliente/event-list-carousel";
import { OfficialSales } from "@/components/cliente/official-sales";
import { OrganizerCTA } from "@/components/cliente/organizer-cta";

import { getEvents } from "@/lib/api/events";
import type { Event } from "@/types/event";

export default function ClientePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getEvents({
          status: "PUBLISHED",
        });

        setEvents(data);
      } catch (error) {
        console.error("Erro ao carregar eventos da página inicial:", error);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const eventosEmAlta = events.slice(0, 5);

  const recomendacoes = events.slice(2, 7);

  const showsMusicas = events.filter(
    (event) => event.category === "Shows & Música",
  );

  const esportes = events.filter(
    (event) => event.category === "Esportes" || event.category === "Games",
  );

  if (loading) {
    return (
      <div className="px-6 py-10 text-center text-muted-foreground">
        Carregando eventos...
      </div>
    );
  }

  return (
    <>
      <EventCarousel events={eventosEmAlta} />

      <EventCategories />

      <EventListCarousel title="Eventos em alta" events={eventosEmAlta} />

      <EventListCarousel title="Recomendações" events={recomendacoes} />

      <OfficialSales />

      <EventListCarousel title="Shows & Música" events={showsMusicas} />

      <EventListCarousel title="Esportes & Games" events={esportes} />

      <OrganizerCTA />
    </>
  );
}
