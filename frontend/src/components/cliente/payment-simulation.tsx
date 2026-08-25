"use client";

import { useState } from "react";

import Link from "next/link";

import { CheckCircle2, CreditCard, XCircle } from "lucide-react";

import { simulatePayment } from "@/lib/api/payments";

import type { PaymentSimulationResult } from "@/types/payment";

import type { Reservation } from "@/types/reservation";

import { Button } from "@/components/ui/button";

type PaymentSimulationProps = {
  reservation: Reservation;
};

export function PaymentSimulation({ reservation }: PaymentSimulationProps) {
  const [result, setResult] = useState<PaymentSimulationResult | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handlePayment(outcome: "APPROVED" | "REJECTED") {
    try {
      setLoading(true);
      setError(null);

      const data = await simulatePayment(reservation.id, outcome);

      setResult(data);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Erro ao processar pagamento.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (result?.payment_status === "APPROVED") {
    return (
      <div className="mt-6">
        <div className="flex flex-col items-center rounded-xl border p-6 text-center">
          <CheckCircle2 size={56} className="text-green-600" />

          <h2 className="mt-4 text-xl font-bold">Pagamento aprovado</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {result.ticket_count} ingresso(s) foram gerados.
          </p>

          <Link href="/cliente/ingressos" className="mt-6 w-full">
            <Button className="w-full">Ver meus ingressos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard size={20} />

        <h2 className="font-semibold">Pagamento simulado</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Escolha um resultado para simular a resposta do processamento do
        pagamento.
      </p>

      {result?.payment_status === "REJECTED" && (
        <div className="flex gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <XCircle className="shrink-0 text-destructive" />

          <div>
            <p className="font-semibold">Pagamento recusado</p>

            <p className="text-sm text-muted-foreground">
              Nenhum ingresso foi gerado. Você pode tentar novamente.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        className="h-12 w-full"
        disabled={loading}
        onClick={() => handlePayment("APPROVED")}
      >
        Simular pagamento aprovado
      </Button>

      <Button
        variant="destructive"
        className="h-12 w-full"
        disabled={loading}
        onClick={() => handlePayment("REJECTED")}
      >
        Simular pagamento recusado
      </Button>
    </div>
  );
}
