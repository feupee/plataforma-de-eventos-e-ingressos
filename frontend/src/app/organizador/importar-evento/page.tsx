import { ImportExternalEvents } from "@/components/organizador/import-external-events";

import { SyncTicketmasterCatalog } from "@/components/organizador/sync-ticketmaster-catalog";

export default function ImportEventPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ticketmaster</h1>

        <p className="mt-2 text-muted-foreground">
          Sincronize eventos com o catálogo do IngressoLivre ou escolha
          individualmente um evento para revisar antes da criação.
        </p>
      </div>

      <SyncTicketmasterCatalog />

      <div className="border-t" />

      <ImportExternalEvents />
    </div>
  );
}
