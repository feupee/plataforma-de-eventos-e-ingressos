import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const categories = [
  "Teatro",
  "Infantil & Família",
  "Comédia",
  "Esportes",
  "Shows & Música",
  "Festivais",
  "Com desconto",
  "Gastronomia",
  "Evento Online",
  "Cursos",
  "Tecnologia",
  "Games",
  "Festas",
  "Palestras",
  "Feiras",
  "Arte & Cultura",
];

export function EventCategories() {
  return (
    <section className="w-full px-6 py-6">
      <h2 className="mb-4 text-2xl font-bold">Encontre seu próximo evento</h2>

      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {categories.map((category) => (
            <CarouselItem key={category} className="basis-auto">
              <Link
                href={`/cliente/eventos?categoria=${encodeURIComponent(category)}`}
              >
                <Button
                  variant="outline"
                  className="h-11 rounded-full px-5 text-base whitespace-nowrap"
                >
                  {category}
                </Button>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
