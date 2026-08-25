"use client";

import Image from "next/image";
import Link from "next/link";

import type { Event } from "@/types/event";

import { Button } from "@/components/ui/button";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type EventCarouselProps = {
  events: Event[];
};

export function EventCarousel({ events }: EventCarouselProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="w-full overflow-hidden py-6">
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {events.map((event, index) => (
            <CarouselItem
              key={event.id}
              className="basis-[90%] md:basis-[85%] lg:basis-[80%]"
            >
              <div className="relative h-[300px] w-full overflow-hidden rounded-xl md:h-[400px] lg:h-[480px]">
                {event.image_url ? (
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    fill
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 640px) 90vw, (max-width: 768px) 85vw, 80vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
                    Evento sem imagem
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute bottom-0 left-0 p-6 text-white md:p-8">
                  <p className="text-sm font-medium">{event.category}</p>

                  <h2 className="mt-1 text-2xl font-bold md:text-4xl">
                    {event.title}
                  </h2>

                  <p className="mt-2 text-sm text-white/80">{event.location}</p>

                  <p className="mt-1 text-sm text-white/80">
                    A partir de R$ {Number(event.half_price).toFixed(2)}
                  </p>

                  <Link href={`/cliente/eventos/${event.id}/reserva`}>
                    <Button className="mt-5">Ver ingressos</Button>
                  </Link>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-5 hidden md:flex" />
        <CarouselNext className="right-5 hidden md:flex" />
      </Carousel>
    </section>
  );
}
