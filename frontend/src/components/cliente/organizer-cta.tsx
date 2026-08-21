import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Headphones } from "lucide-react";

import { Button } from "@/components/ui/button";

export function OrganizerCTA() {
  return (
    <section className="w-full px-6 py-10">
      <div className="grid overflow-hidden rounded-2xl bg-primary/10 md:grid-cols-2">
        {/* Conteúdo */}
        <div className="flex flex-col justify-center p-8 md:p-10">
          <h2 className="max-w-md text-3xl font-bold text-primary">
            Crie eventos, divulgue e venda ingressos com facilidade
          </h2>
          <p className="text-muted-foreground mt-4">
            Organize seus eventos de forma simples e eficiente. Publique
            gratuitamente e venda ingressos diretamente para seus clientes.
          </p>
        </div>

        {/* Imagem + botões */}
        <div className="flex min-w-0 flex-col justify-center bg-card p-6">
          <div className="mt-4 flex w-full flex-col gap-3 lg:flex-row lg:justify-center">
            <Link href="/organizador" className="w-full lg:w-auto">
              <Button className="h-12 w-full px-6 text-base lg:w-auto lg:px-8">
                Crie seu evento
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
