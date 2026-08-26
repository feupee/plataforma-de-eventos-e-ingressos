import { Suspense } from "react";

import { EventCatalog } from "@/components/cliente/event-catalog";

import { ExternalEvents } from "@/components/cliente/external-events";

export default function EventosPage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="p-10 text-center text-muted-foreground">
            Carregando eventos...
          </div>
        }
      >
        <EventCatalog />
      </Suspense>

      <div className="mx-auto my-4 w-full max-w-7xl px-6">
        <div className="border-t" />
      </div>

      <ExternalEvents />
    </>
  );
}
