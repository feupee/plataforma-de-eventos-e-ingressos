"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const events = [
  {
    id: 1,
    title: "Festival de Música 2026",
    category: "Música",
    date: "12 de Setembro",
    location: "Uberlândia - MG",
    image: "/carousel/evento1.png",
  },
  {
    id: 2,
    title: "Tech Conference",
    category: "Tecnologia",
    date: "20 de Setembro",
    location: "São Paulo - SP",
    image: "/carousel/evento2.png",
  },
  {
    id: 3,
    title: "Festival Gastronômico",
    category: "Gastronomia",
    date: "28 de Setembro",
    location: "Belo Horizonte - MG",
    image: "/carousel/evento3.png",
  },
  {
    id: 4,
    title: "Stand-up Comedy Night",
    category: "Comédia",
    date: "05 de Outubro",
    location: "Uberlândia - MG",
    image: "/carousel/evento4.png",
  },
  {
    id: 5,
    title: "Campeonato de E-Sports",
    category: "Games",
    date: "18 de Outubro",
    location: "São Paulo - SP",
    image: "/carousel/evento5.png",
  },
];

export function EventCarousel() {
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
                {/* Imagem */}
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 640px) 90vw, (max-width: 768px) 85vw, 80vw"
                  className="object-cover"
                />

                {/* Escurece o lado esquerdo */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />

                {/* Informações do evento */}
                <div className="absolute bottom-0 left-0 p-8 text-white md:p-12">
                  <span className="text-sm font-medium text-white/70">
                    {event.category}
                  </span>

                  <h2 className="mt-2 text-3xl font-bold md:text-5xl">
                    {event.title}
                  </h2>

                  <div className="mt-4 flex flex-col gap-1 text-sm text-white/80 md:flex-row md:gap-4">
                    <span>{event.date}</span>

                    <span className="hidden md:block">•</span>

                    <span>{event.location}</span>
                  </div>

                  <div className="mt-6">
                    <Link href={`/cliente/eventos/${event.id}`}>
                      <Button>Ver ingressos</Button>
                    </Link>
                  </div>
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
