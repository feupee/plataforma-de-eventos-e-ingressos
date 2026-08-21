import Image from "next/image";
import Link from "next/link";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Event = {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
};

type EventListCarouselProps = {
  title: string;
  events: Event[];
};

export function EventListCarousel({ title, events }: EventListCarouselProps) {
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
          {events.map((event) => (
            <CarouselItem
              key={event.id}
              className="basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <Link href={`/cliente/eventos/${event.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="(max-width: 640px) 85vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="mt-3">
                    <h3 className="text-lg font-semibold">{event.title}</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.date}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {event.location}
                    </p>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </section>
  );
}
