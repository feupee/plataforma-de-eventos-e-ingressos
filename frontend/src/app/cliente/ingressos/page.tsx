import { MyTickets } from "@/components/cliente/my-tickets";

export default function IngressosPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Meus ingressos</h1>

        <p className="mt-2 text-muted-foreground">
          Consulte seus ingressos e apresente o QR Code na entrada do evento.
        </p>
      </div>

      <MyTickets />
    </section>
  );
}
