import Link from "next/link";

import { Download } from "lucide-react";

import { CreateEventForm } from "@/components/organizador/create-event-form";

import { Button } from "@/components/ui/button";

export default function CreateEventPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criar evento</h1>

          <p className="mt-2 text-muted-foreground">
            Cadastre manualmente ou importe informações da Ticketmaster.
          </p>
        </div>

        <Link href="/organizador/importar-evento">
          <Button variant="outline">
            <Download />
            Importar da Ticketmaster
          </Button>
        </Link>
      </div>

      <CreateEventForm />
    </div>
  );
}
