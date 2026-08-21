import { EventCarousel } from "@/components/cliente/event-carousel";
import { EventCategories } from "@/components/cliente/event-cateegories";
import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";
import { EventListCarousel } from "@/components/cliente/event-list-carousel";
import { OfficialSales } from "@/components/cliente/official-sales";
import {
  esportes,
  eventosEmAlta,
  recomendacoes,
  showsMusicas,
} from "@/lib/mock-events";
import { OrganizerCTA } from "@/components/cliente/organizer-cta";

export default function ClientePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <EventCarousel />
      <EventCategories />
      <EventListCarousel title="Eventos em alta" events={eventosEmAlta} />

      <EventListCarousel title="Recomendações" events={recomendacoes} />

      <OfficialSales />

      <EventListCarousel title="Shows & Música" events={showsMusicas} />

      <EventListCarousel title="Esportes" events={esportes} />
      <OrganizerCTA />
      <Footer />
    </main>
  );
}
