"use client";

import Image from "next/image";
import Link from "next/link";

import { CalendarDays, MapPin } from "lucide-react";

import type { Event } from "@/types/event";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type EventListCarouselProps = {
  title: string;
  events: Event[];
};

export function EventListCarousel({ title, events }: EventListCarouselProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-6 py-8">
      <h2 className="mb-5 text-2xl font-bold">{title}</h2>

      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          {events.map((event) => {
            const eventDate = new Date(event.event_date);

            const formattedDate = new Intl.DateTimeFormat("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }).format(eventDate);

            return (
              <CarouselItem
                key={event.id}
                className="basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <Link href={`/cliente/eventos/${event.id}/reserva`}>
                  <div className="group cursor-pointer">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
                      {event.image_url ? (
                        <Image
                          src={event.image_url}
                          alt={event.title}
                          fill
                          sizes="(max-width: 640px) 85vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                          Evento sem imagem
                        </div>
                      )}
                    </div>

                    <div className="mt-3">
                      <h3 className="text-lg font-semibold">{event.title}</h3>

                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays size={15} />

                        <span>{formattedDate}</span>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin size={15} />

                        <span>{event.location}</span>
                      </div>

                      <p className="mt-2 font-semibold">
                        A partir de R$ {Number(event.half_price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </section>
  );
}
