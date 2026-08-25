import { EventCarousel } from "@/components/cliente/event-carousel";
import { EventCategories } from "@/components/cliente/event-categories";
import { EventListCarousel } from "@/components/cliente/event-list-carousel";
import { OfficialSales } from "@/components/cliente/official-sales";
import { OrganizerCTA } from "@/components/cliente/organizer-cta";

import {
  esportes,
  eventosEmAlta,
  recomendacoes,
  showsMusicas,
} from "@/lib/mock-events";

export default function ClientePage() {
  return (
    <>
      <EventCarousel />

      <EventCategories />

      <EventListCarousel title="Eventos em alta" events={eventosEmAlta} />

      <EventListCarousel title="Recomendações" events={recomendacoes} />

      <OfficialSales />

      <EventListCarousel title="Shows & Música" events={showsMusicas} />

      <EventListCarousel title="Esportes" events={esportes} />

      <OrganizerCTA />
    </>
  );
}
