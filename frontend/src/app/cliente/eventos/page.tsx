import { Suspense } from "react";

import { EventCatalog } from "@/components/cliente/event-catalog";

export default function EventosPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-muted-foreground">
          Carregando eventos...
        </div>
      }
    >
      <EventCatalog />
    </Suspense>
  );
}
