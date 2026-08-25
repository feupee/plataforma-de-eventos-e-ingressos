import { TicketCard } from "@/components/cliente/ticket-card";
import { meusIngressos } from "@/lib/mock-tickets";

export default function IngressosPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Meus ingressos</h1>

        <p className="mt-2 text-muted-foreground">
          Consulte seus ingressos e apresente o QR Code na entrada do evento.
        </p>
      </div>

      {meusIngressos.length === 0 ? (
        <div className="rounded-xl border p-10 text-center">
          <h2 className="text-xl font-semibold">
            Você ainda não possui ingressos
          </h2>

          <p className="mt-2 text-muted-foreground">
            Quando realizar uma compra, seus ingressos aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {meusIngressos.map((ticket) => (
            <TicketCard
              key={ticket.id}
              eventName={ticket.eventName}
              date={ticket.date}
              time={ticket.time}
              location={ticket.location}
              ticketType={ticket.ticketType}
              price={ticket.price}
              image={ticket.image}
              code={ticket.code}
              status={ticket.status}
            />
          ))}
        </div>
      )}
    </section>
  );
}
