"use client";

import { useEffect, useState } from "react";

import { EventCarousel } from "@/components/cliente/event-carousel";

import { EventCategories } from "@/components/cliente/event-categories";

import { EventListCarousel } from "@/components/cliente/event-list-carousel";

import { OfficialSales } from "@/components/cliente/official-sales";

import { OrganizerCTA } from "@/components/cliente/organizer-cta";

import { getEvents } from "@/lib/api/events";

import type { Event } from "@/types/event";

function uniqueByTitle(events: Event[]): Event[] {
  const seen = new Set<string>();

  return events.filter((event) => {
    const normalizedTitle = event.title.trim().toLocaleLowerCase("pt-BR");

    if (seen.has(normalizedTitle)) {
      return false;
    }

    seen.add(normalizedTitle);

    return true;
  });
}

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
        console.error("Erro ao carregar eventos:", error);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const uniqueEvents = uniqueByTitle(events);

  // =====================================================
  // EVENTOS EM ALTA
  // =====================================================

  const eventosEmAlta = uniqueEvents.slice(0, 5);

  // =====================================================
  // RECOMENDAÇÕES
  // =====================================================

  const eventosEmAltaIds = new Set(eventosEmAlta.map((event) => event.id));

  const recomendacoes = uniqueEvents
    .filter((event) => !eventosEmAltaIds.has(event.id))
    .slice(0, 8);

  // =====================================================
  // SHOWS & MÚSICA
  // =====================================================

  const showsMusica = uniqueByTitle(
    events.filter((event) => event.category === "Shows & Música"),
  );

  // =====================================================
  // ESPORTES + GAMES
  // =====================================================

  const esportesGames = uniqueByTitle(
    events.filter(
      (event) => event.category === "Esportes" || event.category === "Games",
    ),
  );

  // =====================================================
  // TEATRO + COMÉDIA
  // =====================================================

  const teatroComedia = uniqueByTitle(
    events.filter(
      (event) => event.category === "Teatro" || event.category === "Comédia",
    ),
  );

  // =====================================================
  // FESTIVAIS + FESTAS
  // =====================================================

  const festivaisFestas = uniqueByTitle(
    events.filter(
      (event) => event.category === "Festivais" || event.category === "Festas",
    ),
  );

  // =====================================================
  // TECNOLOGIA + PALESTRAS + FEIRAS
  // =====================================================

  const tecnologia = uniqueByTitle(
    events.filter(
      (event) =>
        event.category === "Tecnologia" ||
        event.category === "Palestras" ||
        event.category === "Feiras",
    ),
  );

  // =====================================================
  // ARTE & CULTURA
  // =====================================================

  const arteCultura = uniqueByTitle(
    events.filter((event) => event.category === "Arte & Cultura"),
  );

  // =====================================================
  // INFANTIL & FAMÍLIA
  // =====================================================

  const infantilFamilia = uniqueByTitle(
    events.filter((event) => event.category === "Infantil & Família"),
  );

  // =====================================================
  // GASTRONOMIA
  // =====================================================

  const gastronomia = uniqueByTitle(
    events.filter((event) => event.category === "Gastronomia"),
  );

  // =====================================================
  // PRÓXIMOS EVENTOS
  // =====================================================

  const proximosEventos = [...uniqueEvents]
    .sort(
      (eventA, eventB) =>
        new Date(eventA.event_date).getTime() -
        new Date(eventB.event_date).getTime(),
    )
    .slice(0, 8);

  // =====================================================
  // MAIS EVENTOS PARA VOCÊ
  // =====================================================

  const proximosIds = new Set(proximosEventos.map((event) => event.id));

  let maisEventos = uniqueEvents
    .filter((event) => !proximosIds.has(event.id))
    .slice(0, 8);

  if (maisEventos.length === 0) {
    maisEventos = uniqueEvents.slice(0, 8);
  }

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

      <EventListCarousel title="Shows & Música" events={showsMusica} />

      <EventListCarousel title="Esportes & Games" events={esportesGames} />

      <EventListCarousel title="Teatro & Comédia" events={teatroComedia} />

      <EventListCarousel title="Festivais & Festas" events={festivaisFestas} />

      <EventListCarousel
        title="Tecnologia, palestras & feiras"
        events={tecnologia}
      />

      <EventListCarousel title="Arte & Cultura" events={arteCultura} />

      <EventListCarousel title="Infantil & Família" events={infantilFamilia} />

      <EventListCarousel title="Gastronomia" events={gastronomia} />

      {/* ================================================ */}
      {/* CTA NO MEIO DA PÁGINA                            */}
      {/* ================================================ */}

      <OrganizerCTA />

      {/* ================================================ */}
      {/* DUAS SEÇÕES ABAIXO DO CTA                        */}
      {/* ================================================ */}

      <EventListCarousel title="Próximos eventos" events={proximosEventos} />

      <EventListCarousel title="Mais eventos para você" events={maisEventos} />
    </>
  );
}
