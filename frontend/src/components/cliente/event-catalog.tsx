"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, MapPin, Search } from "lucide-react";

import { todosEventos } from "@/lib/mock-events";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function EventCatalog() {
  const searchParams = useSearchParams();

  const busca = searchParams.get("busca")?.toLowerCase() ?? "";
  const categoria = searchParams.get("categoria")?.toLowerCase() ?? "";

  const eventosFiltrados = todosEventos.filter((event) => {
    const correspondeBusca =
      event.title.toLowerCase().includes(busca) ||
      event.location.toLowerCase().includes(busca) ||
      event.category.toLowerCase().includes(busca);

    const correspondeCategoria =
      categoria === "" || event.category.toLowerCase() === categoria;

    return correspondeBusca && correspondeCategoria;
  });

  return (
    <section className="w-full px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Eventos</h1>

        <p className="mt-2 text-muted-foreground">
          Encontre eventos, shows, festivais e experiências.
        </p>
      </div>

      {/* Pesquisa */}
      <form action="/cliente/eventos" className="mb-8 flex max-w-2xl gap-2">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />

          <Input
            name="busca"
            defaultValue={searchParams.get("busca") ?? ""}
            placeholder="Pesquisar por evento, categoria ou local..."
            className="pl-10"
          />
        </div>

        <Button type="submit">Buscar</Button>
      </form>

      {/* Resultado */}
      {eventosFiltrados.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <h2 className="text-xl font-semibold">Nenhum evento encontrado</h2>

          <p className="mt-2 text-muted-foreground">
            Tente pesquisar outro nome, categoria ou local.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {eventosFiltrados.map((event) => (
            <Link key={event.id} href="/cliente/reserva" className="group">
              <article className="overflow-hidden rounded-xl border bg-card transition hover:border-primary">
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="p-4">
                  <p className="text-sm font-medium text-primary">
                    {event.category}
                  </p>

                  <h2 className="mt-1 text-lg font-semibold">{event.title}</h2>

                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      <span>{event.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        A partir de
                      </p>

                      <p className="text-xl font-bold">
                        R$ {event.price.toFixed(2)}
                      </p>
                    </div>

                    <span className="text-sm font-medium text-primary">
                      Ver ingressos
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
